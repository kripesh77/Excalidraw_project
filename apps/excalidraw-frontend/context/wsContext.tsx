"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  const listenersRef = useRef(new Set<WsListener>());
  const isConnectedRef = useRef<Boolean>(false);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`,
    );

    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          isConnectedRef.current = true;
        }

        listenersRef.current.forEach((listener) => {
          listener(data);
        });
      } catch {}
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [token]);

  const send = useCallback((payload: WsMessage) => {
    const ws = wsRef.current;

    if (ws?.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify(payload));
  }, []);

  const joinRoom = useCallback((slug: string) => {
    const payload = {
      type: "join_room",
      slug,
    };

    // if already connected → send immediately
    const ws = wsRef.current;

    if (!ws) return;

    if (ws.readyState === WebSocket.OPEN && isConnectedRef.current) {
      ws.send(JSON.stringify(payload));
      return;
    }

    // otherwise wait for open
    const onOpen = () => {
      ws.send(JSON.stringify(payload));
    };

    ws.addEventListener("open", onOpen, { once: true });
  }, []);

  const leaveRoom = useCallback(
    (slug: string) => {
      send({ type: "leave_room", slug });
    },
    [send],
  );

  const sendChat = useCallback(
    (slug: string, message: unknown) => {
      send({ type: "chat", slug, message });
    },
    [send],
  );

  const subscribe = useCallback((listener: WsListener) => {
    listenersRef.current.add(listener);

    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  return (
    <WsContext.Provider
      value={{
        joinRoom,
        leaveRoom,
        sendChat,
        subscribe,
      }}
    >
      {children}
    </WsContext.Provider>
  );
}

export function useWs() {
  const ctx = useContext(WsContext);

  if (!ctx) {
    throw new Error("useWs must be used within WsProvider");
  }

  return ctx;
}
