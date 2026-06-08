"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type WsMessage = {
  type?: string;
  slug?: string;
  message?: unknown;
};

type WsListener = (data: WsMessage) => void;

type WsContextValue = {
  joinRoom: (slug: string) => void;
  leaveRoom: (slug: string) => void;
  sendChat: (slug: string, message: unknown) => void;
  subscribe: (listener: WsListener) => () => void;
  status: "connecting" | "open" | "closed";
};

const WsContext = createContext<WsContextValue | null>(null);

export function WsProvider({
  token,
  children,
}: {
  token: string;
  children: React.ReactNode;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<string[]>([]);
  const listenersRef = useRef<Set<WsListener>>(new Set());
  const readyRef = useRef(false);
  const heartbeatRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const backoffRef = useRef(1000); // start 1s
  const [status, setStatus] = useState<"connecting" | "open" | "closed">(
    "connecting",
  );

  const roomsRef = useRef<Set<string>>(new Set());
  const MAX_QUEUE = 100;

  const readyPromiseRef = useRef<Promise<void> | null>(null);
  let resolveReady: (() => void) | null = null;

  const flushQueue = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    queueRef.current.forEach((payload) => ws.send(payload));
    queueRef.current = [];
  }, []);

  const sendOrQueue = useCallback((payload: WsMessage) => {
    const encoded = JSON.stringify(payload);
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN && readyRef.current) {
      ws.send(encoded);
      return;
    }
    if (queueRef.current.length >= MAX_QUEUE) {
      queueRef.current.shift(); // drop oldest
    }
    queueRef.current.push(encoded);
  }, []);

  const cleanup = useCallback(() => {
    readyRef.current = false;
    setStatus("closed");

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!token) return;

    setStatus("connecting");

    readyPromiseRef.current = new Promise((resolve) => {
      resolveReady = resolve;
    });
    readyRef.current = false;

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`,
    );
    wsRef.current = ws;

    ws.onopen = () => {
      heartbeatRef.current = window.setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);

      flushQueue();
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data) as WsMessage;

        if (data?.type === "connected") {
          readyRef.current = true;
          resolveReady?.();
          resolveReady = null;
          flushQueue();

          roomsRef.current.forEach((slug) => {
            sendOrQueue({ type: "join_room", slug });
          });
        }

        listenersRef.current.forEach((listener) => listener(data));
      } catch (err) {
        console.warn("Invalid WS message", msg.data, err);
      }
    };

    ws.onclose = () => {
      cleanup();
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, backoffRef.current);
    };

    ws.onerror = () => {
      cleanup();
    };
  }, [token, flushQueue, cleanup, sendOrQueue]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      cleanup();
    };
  }, [connect, cleanup]);

  const joinRoom = useCallback(
    async (slug: string) => {
      if (!slug) return;
      roomsRef.current.add(slug);
      await readyPromiseRef.current;
      sendOrQueue({ type: "join_room", slug });
    },
    [sendOrQueue],
  );

  const leaveRoom = useCallback(
    async (slug: string) => {
      if (!slug) return;
      roomsRef.current.delete(slug);
      await readyPromiseRef.current;
      sendOrQueue({ type: "leave_room", slug });
    },
    [sendOrQueue],
  );

  const sendChat = useCallback(
    async (slug: string, message: unknown) => {
      if (!slug) return;
      await readyPromiseRef.current;
      sendOrQueue({ type: "chat", slug, message });
    },
    [sendOrQueue],
  );

  const subscribe = useCallback((listener: WsListener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const value: WsContextValue = {
    joinRoom,
    leaveRoom,
    sendChat,
    subscribe,
    status,
  };

  return <WsContext.Provider value={value}>{children}</WsContext.Provider>;
}

export function useWs() {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error("useWs must be used within WsProvider");
  return ctx;
}
