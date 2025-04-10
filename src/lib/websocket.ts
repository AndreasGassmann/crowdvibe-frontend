"use client";

import { storage } from "./storage";
import { WebSocketMessage } from "../types/websocket";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "wss://crowdvibe.lukeisontheroad.com/ws";

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // Start with 1 second
  private isConnected = false;

  constructor(
    private roomId: string,
    private onMessage: (data: WebSocketMessage) => void,
    private onError?: (error: Event) => void,
    private onClose?: (event: CloseEvent) => void
  ) {}

  connect() {
    const username = storage.getUsername();
    const password = storage.getPassword();
    // const auth = btoa(`${username}:${password}`);

    // Create the WebSocket URL with the auth token as a query parameter
    const wsUrl = `${WS_BASE_URL}/room/${this.roomId}/?username=${username}&password=${password}`;
    console.log("Connecting to WebSocket URL:", wsUrl);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectTimeout = 1000;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as WebSocketMessage;
      this.onMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.isConnected = false;
      this.onError?.(error);
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket closed:", event);
      this.isConnected = false;
      this.onClose?.(event);
      this.handleReconnect();
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
    }
  }

  send(data: WebSocketMessage) {
    console.log("Sending message:", data);
    if (!this.ws) {
      console.error("WebSocket is not initialized");
      return;
    }

    if (this.ws.readyState === WebSocket.CONNECTING) {
      console.log("WebSocket is connecting, waiting for connection...");
      setTimeout(() => this.send(data), 100);
      return;
    }

    if (this.ws.readyState === WebSocket.OPEN && this.isConnected) {
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}
