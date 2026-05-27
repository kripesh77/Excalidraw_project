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
  const readyTimeoutRef = useRef<number | null>(null);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">(
    "connecting",
  );

  const flushQueue = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    queueRef.current.forEach((payload) => ws.send(payload));
    queueRef.current = [];
  }, []);

  const sendOrQueue = useCallback((payload: WsMessage) => {
    const encoded = JSON.stringify(payload);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && readyRef.current) {
      ws.send(encoded);
      return;
    }
    queueRef.current.push(encoded);
  }, []);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL!}?token=${token}`,
    );
    wsRef.current = ws;
    readyRef.current = false;

    ws.onopen = () => {
      setStatus("open");
      // Fallback: if we never receive a "connected" message, flush anyway.
      readyTimeoutRef.current = window.setTimeout(() => {
        readyRef.current = true;
        flushQueue();
      }, 300);
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data) as WsMessage;
        if (data?.type === "connected") {
          readyRef.current = true;
          if (readyTimeoutRef.current) {
            window.clearTimeout(readyTimeoutRef.current);
            readyTimeoutRef.current = null;
          }
          flushQueue();
        }
        listenersRef.current.forEach((listener) => listener(data));
      } catch {
        // ignoring malformed messages
      }
    };

    ws.onclose = () => {
      setStatus("closed");
      readyRef.current = false;
      if (readyTimeoutRef.current) {
        window.clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }
      wsRef.current = null;
    };

    ws.onerror = () => {
      setStatus("closed");
      readyRef.current = false;
      if (readyTimeoutRef.current) {
        window.clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }
    };

    return () => {
      if (readyTimeoutRef.current) {
        window.clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }
      ws.close();
    };
  }, [flushQueue, token]);

  const joinRoom = useCallback(
    (slug: string) => {
      if (!slug) return;
      sendOrQueue({ type: "join_room", slug });
    },
    [sendOrQueue],
  );

  const leaveRoom = useCallback(
    (slug: string) => {
      if (!slug) return;
      sendOrQueue({ type: "leave_room", slug });
    },
    [sendOrQueue],
  );

  const sendChat = useCallback(
    (slug: string, message: unknown) => {
      if (!slug) return;
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
  if (!ctx) {
    throw new Error("useWs must be used within WsProvider");
  }
  return ctx;
}
