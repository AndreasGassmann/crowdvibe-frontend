"use client";

import { storage } from "./storage";
import { type ActionPayload, type BroadcastEvent } from "../types/websocket";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "wss://crowdvibe.lukeisontheroad.com/ws";

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private _isConnected = false;

  constructor(
    private roomId: string,
    private onMessage: (data: BroadcastEvent) => void,
    private onError?: (error: Event) => void,
    private onClose?: (event: CloseEvent) => void
  ) {}

  connect() {
    // If we already have a connection, don't create a new one
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket already connected or connecting");
      return;
    }

    const username = storage.getUsername();
    const password = storage.getPassword();
    const wsUrl = `${WS_BASE_URL}/room/${this.roomId}/?username=${username}&password=${password}`;
    console.log("Connecting to WebSocket URL:", wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this._isConnected = true;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as BroadcastEvent;
      this.onMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this._isConnected = false;
      this.onError?.(error);
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket closed:", event);
      this._isConnected = false;
      this.onClose?.(event);
    };
  }

  public send(message: ActionPayload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    console.log("Sending WebSocket message:", {
      message,
      timestamp: new Date().toISOString(),
      roomId: this.roomId,
    });

    this.ws.send(JSON.stringify(message));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this._isConnected = false;
    }
  }

  public isConnected(): boolean {
    return this._isConnected;
  }
}
