"use client";

import { WebSocketClient } from "./websocket";
import { WebSocketMessage } from "@/types/websocket";

class WebSocketService {
  private static instance: WebSocketService;
  private client: WebSocketClient | null = null;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(roomId: string) {
    if (this.client) {
      this.disconnect();
    }

    this.client = new WebSocketClient(
      roomId,
      (message) => {
        this.messageHandlers.forEach((handler) => handler(message));
      },
      (error) => {
        console.error("WebSocket error:", error);
      },
      (event) => {
        console.log("WebSocket closed 2:", event);
      }
    );

    this.client.connect();
  }

  public disconnect() {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
  }

  public send(message: WebSocketMessage) {
    if (!this.client) {
      throw new Error("WebSocket is not connected");
    }
    this.client.send(message);
  }

  public addMessageHandler(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  public isConnected(): boolean {
    return this.client !== null;
  }
}

export const websocketService = WebSocketService.getInstance();
