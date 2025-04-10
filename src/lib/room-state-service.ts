"use client";

import { BehaviorSubject, Observable } from "rxjs";
import { WebSocketClient } from "./websocket";
import { WebSocketMessage } from "@/types/websocket";
import { Message, Proposal, Room, Round, Leaderboard } from "@/types/api";

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
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];

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
    if (this.client) {
      console.log("Disconnecting existing connection");
      this.disconnect();
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
        this.isConnected = false;
      },
      (event) => {
        console.log("WebSocket closed:", event);
        this.isConnected = false;
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
    this.isConnected = false;
    this.currentRoomSubject.next(null);
  }

  public sendMessage(message: string) {
    console.log("Attempting to send message:", message);
    if (!this.client || !this.isConnected) {
      console.error("WebSocket is not connected");
      return;
    }

    const wsMessage: WebSocketMessage = {
      type: "chat_message",
      message,
    };

    try {
      console.log("Sending WebSocket message:", wsMessage);
      this.client.send(wsMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
      this.isConnected = false;
    }
  }

  private handleWebSocketMessage(message: WebSocketMessage) {
    console.log("Handling WebSocket message:", message);
    switch (message.type) {
      case "broadcast_message":
        const currentState = this.stateSubject.value;
        const newMessage: Message = {
          id: Date.now().toString(),
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

      case "proposals_update":
        this.stateSubject.next({
          ...this.stateSubject.value,
          proposals: message.proposals,
        });
        break;

      case "rounds_update":
        const lastRound = message.rounds[message.rounds.length - 1] || null;
        this.stateSubject.next({
          ...this.stateSubject.value,
          currentRound: lastRound,
        });
        break;

      case "leaderboard_update":
        this.stateSubject.next({
          ...this.stateSubject.value,
          leaderboard: message.leaderboard,
        });
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

  public createProposal(text: string, round: string) {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket is not connected");
      return;
    }

    const wsMessage: WebSocketMessage = {
      type: "create_proposal",
      text,
      round,
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

    const wsMessage: WebSocketMessage = {
      type: "vote",
      proposal: proposalId,
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

    const wsMessage: WebSocketMessage = {
      type: "delete_vote",
      vote_id: voteId,
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

    const wsMessage: WebSocketMessage = {
      type: "get_proposals",
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

    const wsMessage: WebSocketMessage = {
      type: "get_rounds",
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

    const wsMessage: WebSocketMessage = {
      type: "get_leaderboard",
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
