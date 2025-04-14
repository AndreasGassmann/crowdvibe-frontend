"use client";

import { storage } from "./storage";
import { type ActionPayload, type BroadcastEvent } from "../types/websocket";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "wss://crowdvibe.lukeisontheroad.com/ws";

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private _isConnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second delay
  private lastSentMessage: ActionPayload | null = null;

  constructor(
    private roomId: string,
    private onMessage: (data: BroadcastEvent) => void,
    private onError?: (error: Event) => void,
    private onClose?: (event: CloseEvent) => void
  ) {}

  connect() {
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

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
      this.reconnectDelay = 1000;

      // If we have a pending message that failed, try to resend it
      if (this.lastSentMessage) {
        console.log("Resending last failed message:", this.lastSentMessage);
        this.send(this.lastSentMessage);
        this.lastSentMessage = null;
      }
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
      console.log(
        "WebSocket closed with code:",
        event.code,
        "reason:",
        event.reason || "No reason provided"
      );
      this._isConnected = false;
      this.onClose?.(event);

      // For code 1011 (Internal Error), we want to retry immediately
      if (event.code === 1011) {
        console.log(
          "Server reported internal error (1011), attempting immediate reconnect"
        );
        this.reconnectAttempts = 0; // Reset attempts for 1011
        this.reconnectDelay = 100; // Use a shorter delay for first retry
        this.connect();
        return;
      }

      // Try to reconnect if we haven't exceeded max attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`Attempting to reconnect in ${this.reconnectDelay}ms...`);
        this.reconnectTimeout = setTimeout(() => {
          this.reconnectAttempts++;
          this.reconnectDelay *= 2; // Exponential backoff
          this.connect();
        }, this.reconnectDelay);
      } else {
        console.error("Max reconnection attempts reached");
      }
    };
  }

  public send(message: ActionPayload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      this.lastSentMessage = message; // Save the message to retry after reconnection
      return;
    }

    console.log("Sending WebSocket message:", {
      message,
      timestamp: new Date().toISOString(),
      roomId: this.roomId,
    });

    try {
      this.ws.send(JSON.stringify(message));
      this.lastSentMessage = null; // Clear last message on successful send
    } catch (error) {
      console.error("Error sending message:", error);
      this.lastSentMessage = message; // Save failed message to retry
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.lastSentMessage = null; // Clear any pending messages
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
