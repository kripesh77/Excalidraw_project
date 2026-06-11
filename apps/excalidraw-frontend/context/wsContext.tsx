"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ============================================================================
// Types
// ============================================================================

type WsMessage = {
  type: string;
  slug?: string;
  message?: unknown;
};

type WsListener = (data: WsMessage) => void;

type WsContextValue = {
  joinRoom: (slug: string) => void;
  leaveRoom: (slug: string) => void;
  sendData: (data: WsMessage) => void;
  subscribe: (listener: WsListener) => () => void;
  connectionState: ConnectionState;
};

type ConnectionState = "connecting" | "connected" | "disconnected";

// ============================================================================
// Constants
// ============================================================================

const WsContext = createContext<WsContextValue | null>(null);
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL_MS = 3000;

// ============================================================================
// Provider
// ============================================================================

export function WsProvider({
  token,
  children,
}: {
  token: string;
  children: React.ReactNode;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const messageQueueRef = useRef<string[]>([]);
  const listenersRef = useRef(new Set<WsListener>());
  const desiredRoomsRef = useRef(new Set<string>());

  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");

  const sendData = useCallback((data: WsMessage) => {
    const ws = wsRef.current;
    const message = JSON.stringify(data);

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      messageQueueRef.current.push(message);
    }
  }, []);

  const connect = useCallback(() => {
    if (!token || wsRef.current) return;

    setConnectionState("connecting");

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      console.error("NEXT_PUBLIC_WS_URL is not defined");
      setConnectionState("disconnected");
      return;
    }

    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnectionState("connected");
      reconnectAttemptsRef.current = 0;

      desiredRoomsRef.current.forEach((slug) => {
        sendData({ type: "join_room", slug });
      });

      messageQueueRef.current.forEach((msg) => ws.send(msg));
      messageQueueRef.current = [];
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WsMessage;
        listenersRef.current.forEach((listener) => listener(data));
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected");
      wsRef.current = null;
      setConnectionState("disconnected");

      if (event.code === 1000 || !token) {
        return;
      }

      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay =
          RECONNECT_INTERVAL_MS * (reconnectAttemptsRef.current + 1);
        console.log(`Attempting to reconnect in ${delay}ms...`);
        setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error("Max WebSocket reconnect attempts reached.");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };
  }, [token, sendData]);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      if (wsRef.current) {
        console.log("Closing WebSocket connection on cleanup.");
        wsRef.current.close(1000, "Component unmounting");
        wsRef.current = null;
      }
    };
  }, [token, connect]);

  const joinRoom = useCallback(
    (slug: string) => {
      if (!slug || !wsRef.current) return;
      if (wsRef.current.readyState !== WebSocket.OPEN) return;
      desiredRoomsRef.current.add(slug);
      setTimeout(() => sendData({ type: "join_room", slug }), 300);
    },
    [sendData],
  );

  const leaveRoom = useCallback(
    (slug: string) => {
      if (!slug) return;
      desiredRoomsRef.current.delete(slug);
      sendData({ type: "leave_room", slug });
    },
    [sendData],
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
        sendData,
        subscribe,
        connectionState,
      }}
    >
      {children}
    </WsContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useWs() {
  const ctx = useContext(WsContext);
  if (!ctx) {
    throw new Error("useWs must be used within a WsProvider");
  }
  return ctx;
}
