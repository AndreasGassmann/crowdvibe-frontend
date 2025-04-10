"use client";

import { storage } from "./storage";
import { type ActionPayload, type BroadcastEvent } from "../types/websocket";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "wss://crowdvibe.lukeisontheroad.com/ws";

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // Start with 1 second
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
      this.reconnectAttempts = 0;
      this.reconnectTimeout = 1000;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as BroadcastEvent;
      this.onMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this._isConnected = false;
      this.onError?.(error);
      // Only attempt reconnect on actual errors
      this.handleReconnect();
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket closed:", event);
      this._isConnected = false;
      this.onClose?.(event);
      // Only attempt reconnect if the close was not clean
      if (!event.wasClean) {
        this.handleReconnect();
      }
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.reconnectTimeout *= 2; // Exponential backoff
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
        );
        this.connect();
      }, this.reconnectTimeout);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  send(data: ActionPayload) {
    if (!this.ws) {
      console.error("WebSocket is not initialized");
      return;
    }

    if (this.ws.readyState === WebSocket.CONNECTING) {
      console.log("WebSocket is connecting, waiting for connection...");
      setTimeout(() => this.send(data), 100);
      return;
    }

    if (this.ws.readyState === WebSocket.OPEN && this._isConnected) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error("Error sending message:", error);
        this.handleReconnect();
      }
    } else {
      console.error("WebSocket is not in OPEN state:", this.ws.readyState);
      this.handleReconnect();
    }
  }

  disconnect() {
    // Only disconnect if we have an active connection
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
      this.ws = null;
      this._isConnected = false;
    }
  }

  public isConnected(): boolean {
    return this._isConnected;
  }
}
