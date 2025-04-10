"use client";

import { useEffect, useRef } from "react";
import { WebSocketClient } from "@/lib/websocket";
import { WebSocketMessage } from "@/types/websocket";

interface WebSocketConnectionProps {
  roomId: string;
  onMessage?: (data: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
}

export function WebSocketConnection({
  roomId,
  onMessage = () => {},
  onError = () => {},
  onClose = () => {},
}: WebSocketConnectionProps) {
  const wsClientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    // Create and connect WebSocket client
    wsClientRef.current = new WebSocketClient(
      roomId,
      onMessage,
      onError,
      onClose
    );
    wsClientRef.current.connect();

    // Cleanup on unmount
    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }
    };
  }, [roomId, onMessage, onError, onClose]);

  return null; // This component doesn't render anything
}
