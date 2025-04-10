"use client";

import { BehaviorSubject, Observable } from "rxjs";
import { WebSocketClient } from "./websocket";
import { Message, Proposal, Room, Round, Leaderboard } from "@/types/api";
import type { ActionPayload, BroadcastEvent } from "../types/websocket";

export interface RoomState {
  messages: Message[];
  proposals: Proposal[];
  currentRound: Round | null;
  leaderboard: Leaderboard[];
}

class RoomStateService {
  private static instance: RoomStateService;
  private client: WebSocketClient | null = null;
  private isConnected = false;
  private stateSubject = new BehaviorSubject<RoomState>({
    messages: [],
    proposals: [],
    currentRound: null,
    leaderboard: [],
  });
  private currentRoomSubject = new BehaviorSubject<Room | null>(null);
  private messageHandlers: ((message: BroadcastEvent) => void)[] = [];

  private constructor() {}

  public static getInstance(): RoomStateService {
    if (!RoomStateService.instance) {
      RoomStateService.instance = new RoomStateService();
    }
    return RoomStateService.instance;
  }

  public getState(): Observable<RoomState> {
    return this.stateSubject.asObservable();
  }

  public getCurrentRoom(): Observable<Room | null> {
    return this.currentRoomSubject.asObservable();
  }

  public connect(roomId: string) {
    console.log("Connecting to room:", roomId);

    // Only disconnect if we're connecting to a different room
    if (this.client && this.currentRoomSubject.value?.id !== roomId) {
      console.log("Disconnecting existing connection for different room");
      this.disconnect();
    }

    // If we already have a client for this room, don't create a new one
    if (this.client && this.currentRoomSubject.value?.id === roomId) {
      console.log("Already connected to this room");
      return;
    }

    this.currentRoomSubject.next({
      id: roomId,
      name: "Main Room", // This will be updated when we fetch the room details
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    });
    this.stateSubject.next({
      messages: [],
      proposals: [],
      currentRound: null,
      leaderboard: [],
    });

    this.client = new WebSocketClient(
      roomId,
      (message) => {
        console.log("Received WebSocket message:", message);
        this.handleWebSocketMessage(message);
      },
      (error) => {
        console.error("WebSocket error:", error);
      },
      (event) => {
        console.log("WebSocket closed:", event);
      }
    );

    this.client.connect();
  }

  public disconnect() {
    console.log("Disconnecting WebSocket");
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
    this.currentRoomSubject.next(null);
  }

  public sendMessage(message: string) {
    console.log("Attempting to send message:", message);
    if (!this.client || !this.client.isConnected()) {
      console.error("WebSocket is not connected");
      return;
    }

    const wsMessage: ActionPayload = {
      type: "chat_action",
      message,
    };

    try {
      console.log("Sending WebSocket message:", wsMessage);
      this.client.send(wsMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  private handleWebSocketMessage(message: BroadcastEvent) {
    console.log("Handling WebSocket message:", message);
    switch (message.type) {
      case "chat_broadcast":
        const currentState = this.stateSubject.value;
        const newMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          room: this.currentRoomSubject.value?.id || "0",
          user: 0, // This will be updated by the server
          username: message.username,
          first_name: message.first_name,
          message: message.message,
          created: message.created,
          updated: message.created,
        };

        console.log("Adding new message to state:", newMessage);
        this.stateSubject.next({
          ...currentState,
          messages: [...currentState.messages, newMessage],
        });
        break;

      case "proposal_broadcast":
        // Handle proposal updates
        break;

      case "round_broadcast":
        // Handle round updates
        break;

      case "leaderboard_broadcast":
        // Handle leaderboard updates
        break;
    }
  }

  public updateMessages(messages: Message[]) {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      messages,
    });
  }

  public updateProposals(proposals: Proposal[]) {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      proposals,
    });
  }

  public updateCurrentRound(round: Round | null) {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      currentRound: round,
    });
  }

  public updateLeaderboard(leaderboard: Leaderboard[]) {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      leaderboard,
    });
  }

  public createProposal(text: string) {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket is not connected");
      return;
    }

    const wsMessage: ActionPayload = {
      type: "proposal_action",
      proposal: text,
    };

    try {
      this.client.send(wsMessage);
    } catch (error) {
      console.error("Failed to create proposal:", error);
      this.isConnected = false;
    }
  }

  public vote(proposalId: number) {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket is not connected");
      return;
    }

    const wsMessage: ActionPayload = {
      type: "proposal_action",
      proposal: proposalId.toString(),
    };

    try {
      this.client.send(wsMessage);
    } catch (error) {
      console.error("Failed to vote:", error);
      this.isConnected = false;
    }
  }

  public deleteVote(voteId: number) {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket is not connected");
      return;
    }

    const wsMessage: ActionPayload = {
      type: "proposal_action",
      proposal: voteId.toString(),
    };

    try {
      this.client.send(wsMessage);
    } catch (error) {
      console.error("Failed to delete vote:", error);
      this.isConnected = false;
    }
  }

  public requestProposals() {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket is not connected");
      return;
    }

    const wsMessage: ActionPayload = {
      type: "proposal_action",
      proposal: "get",
    };

    try {
      this.client.send(wsMessage);
    } catch (error) {
      console.error("Failed to request proposals:", error);
      this.isConnected = false;
    }
  }

  public requestRounds() {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket is not connected");
      return;
    }

    const wsMessage: ActionPayload = {
      type: "round_action",
      round: "get",
    };

    try {
      this.client.send(wsMessage);
    } catch (error) {
      console.error("Failed to request rounds:", error);
      this.isConnected = false;
    }
  }

  public requestLeaderboard() {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket is not connected");
      return;
    }

    const wsMessage: ActionPayload = {
      type: "leaderboard_action",
      entry: 0, // This will be ignored by the server for get requests
    };

    try {
      this.client.send(wsMessage);
    } catch (error) {
      console.error("Failed to request leaderboard:", error);
      this.isConnected = false;
    }
  }
}

export const roomStateService = RoomStateService.getInstance();
