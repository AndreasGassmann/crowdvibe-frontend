"use client";

import { BehaviorSubject, Observable } from "rxjs";
import { WebSocketClient } from "./websocket";
import { Message, Proposal, Room, Round, Leaderboard } from "@/types/api";
import type { ActionPayload, BroadcastEvent } from "../types/websocket";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://crowdvibe.lukeisontheroad.com/api/v1";

export interface RoomState {
  messages: Message[];
  proposals: Proposal[];
  currentRound: Round | null;
  leaderboard: Leaderboard[];
}

class RoomStateService {
  private static instance: RoomStateService;
  private client: WebSocketClient | null = null;
  private stateSubject = new BehaviorSubject<RoomState>({
    messages: [],
    proposals: [],
    currentRound: null,
    leaderboard: [],
  });
  private currentRoomSubject = new BehaviorSubject<Room | null>(null);
  private messageHandlers: ((message: BroadcastEvent) => void)[] = [];
  private pendingMessages: Array<{
    message: ActionPayload;
    errorMessage: string;
  }> = [];
  private connecting = false;

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

  public connect(roomId: string, messageToQueue?: ActionPayload) {
    console.log("Connecting to room:", roomId);
    this.connecting = true;

    // Only disconnect if we're connecting to a different room
    if (this.client && this.currentRoomSubject.value?.id !== roomId) {
      console.log("Disconnecting existing connection for different room");
      this.disconnect();
    }

    // If we already have a client for this room, don't create a new one
    if (this.client && this.currentRoomSubject.value?.id === roomId) {
      console.log("Already connected to this room");
      this.connecting = false;

      // If there's a message to queue, send it now
      if (messageToQueue) {
        this.client.send(messageToQueue);
      }

      // Process any pending messages
      this.processPendingMessages();

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
        this.connecting = false;
      }
    );

    this.client.connect();

    // Set up a connection success handler
    setTimeout(() => {
      if (this.client && this.client.isConnected()) {
        console.log(
          "WebSocket connection successful, processing pending messages"
        );
        this.connecting = false;

        // If there's a message to queue, send it now
        if (messageToQueue && this.client) {
          this.client.send(messageToQueue);
        }

        // Process pending messages after a short delay to ensure connection is stable
        this.processPendingMessages();
      }
    }, 500); // Short delay to check connection status
  }

  public disconnect() {
    console.log("Disconnecting WebSocket");
    this.connecting = false;
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
    this.currentRoomSubject.next(null);
    // Clear pending messages when disconnecting
    this.pendingMessages = [];
  }

  // Process all pending messages
  private processPendingMessages() {
    if (this.pendingMessages.length === 0 || !this.client) {
      return;
    }

    console.log(`Processing ${this.pendingMessages.length} pending messages`);

    // Create a copy of the pending messages and clear the queue
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];

    // Process each message
    messages.forEach(({ message, errorMessage }) => {
      if (this.client) {
        try {
          this.client.send(message);
        } catch (error) {
          console.error(errorMessage, error);
        }
      }
    });
  }

  public sendMessage(message: string) {
    const wsMessage: ActionPayload = {
      type: "chat_action",
      message,
    };

    this.sendAction(wsMessage, "Failed to send message");
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
          type: "user", // Set type for user messages
        };

        console.log("Adding new message to state:", newMessage);
        this.stateSubject.next({
          ...currentState,
          messages: [...currentState.messages, newMessage],
        });
        break;

      case "proposal_broadcast":
        console.log("Received proposal broadcast:", message);
        const proposals = this.stateSubject.value.proposals;
        const currentRound = this.stateSubject.value.currentRound;

        // Single proposal update
        const newProposal: Proposal = {
          id: message.id,
          room: this.currentRoomSubject.value?.id || "0",
          round: currentRound?.id || "0", // Use current round ID
          user: 0, // This will be updated by the server
          username: message.username,
          first_name: message.first_name,
          text: message.proposal,
          vote_count: message.vote_count,
          users_voted: message.users_voted,
          created: message.created,
          updated: message.created,
        };

        // Update existing proposal or add new one
        const updatedProposals = proposals.map((p) =>
          p.id === message.id ? newProposal : p
        );

        // If it's a new proposal, add it to the list
        if (!proposals.some((p) => p.id === message.id)) {
          updatedProposals.push(newProposal);
        }

        // Sort proposals by vote count in descending order
        updatedProposals.sort((a, b) => b.vote_count - a.vote_count);

        this.stateSubject.next({
          ...this.stateSubject.value,
          proposals: updatedProposals,
        });
        break;

      case "round_broadcast":
        console.log("Received round broadcast:", message);
        const newRound: Round = {
          id: message.id,
          roomId: this.currentRoomSubject.value?.id || "0",
          counter: message.counter,
          duration: message.duration,
          game: message.game,
          gameUrl: `${API_BASE_URL}/rounds/${message.id}/game/`,
          created: message.created,
          updated: message.created,
        };

        // Clear proposals from previous rounds when a new round is received
        const currentProposals = this.stateSubject.value.proposals;
        const currentRoundProposals = currentProposals.filter(
          (proposal) => proposal.round === message.id
        );

        // Add system message for new round
        const systemMessage: Message = {
          id: `sys-${Date.now()}`,
          room: this.currentRoomSubject.value?.id || "0",
          user: 0,
          username: "System",
          first_name: "System",
          message: `New Round #${newRound.counter} started!`,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          type: "system",
        };

        this.stateSubject.next({
          ...this.stateSubject.value,
          currentRound: newRound,
          proposals: currentRoundProposals,
          messages: [...this.stateSubject.value.messages, systemMessage], // Add system message
        });
        break;

      case "leaderboard_broadcast":
        console.log("Received leaderboard broadcast:", message);
        const currentLeaderboard = this.stateSubject.value.leaderboard;

        const newEntry: Leaderboard = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          room: this.currentRoomSubject.value?.id || "0",
          round: this.stateSubject.value.currentRound?.id || "0",
          user: 0, // This will be updated by the server
          username: message.username,
          score: message.score,
          tries: message.tries,
          created: message.created,
          updated: message.created,
        };

        // Update existing entry or add new one
        const userEntryIndex = currentLeaderboard.findIndex(
          (entry) => entry.username === message.username
        );

        let updatedLeaderboard;
        if (userEntryIndex >= 0) {
          // Update existing entry
          updatedLeaderboard = [...currentLeaderboard];
          updatedLeaderboard[userEntryIndex] = newEntry;
        } else {
          // Add new entry
          updatedLeaderboard = [...currentLeaderboard, newEntry];
        }

        // Sort leaderboard by score in descending order
        updatedLeaderboard.sort((a, b) => b.score - a.score);

        this.stateSubject.next({
          ...this.stateSubject.value,
          leaderboard: updatedLeaderboard,
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

  public createProposal(text: string) {
    const wsMessage: ActionPayload = {
      type: "proposal_action",
      proposal: text,
    };

    this.sendAction(wsMessage, "Failed to create proposal");
  }

  public vote(proposalId: string) {
    const wsMessage: ActionPayload = {
      type: "vote_action",
      proposal_id: proposalId,
    };

    this.sendAction(wsMessage, "Failed to vote");
  }

  public deleteVote(voteId: string) {
    const wsMessage: ActionPayload = {
      type: "unvote_action",
      proposal_id: voteId,
    };

    this.sendAction(wsMessage, "Failed to delete vote");
  }

  public createLeaderboardEntry(score: number) {
    const wsMessage: ActionPayload = {
      type: "leaderboard_action",
      entry: score,
    };

    this.sendAction(wsMessage, "Failed to create leaderboard entry");
  }

  // Helper method to send actions and handle errors consistently
  private sendAction(message: ActionPayload, errorMessage: string) {
    // If client doesn't exist yet or we're in the process of connecting, queue the message
    if (!this.client || this.connecting) {
      console.warn("WebSocket client not ready, queueing message for later");

      // Queue the message even if no room is explicitly set yet
      // We'll use a default room ID if none is set
      const roomId =
        this.currentRoomSubject.value?.id ||
        "9675eee6-7e4b-4143-8b55-96fd47e5a748"; // Default room ID

      // Queue the message for later processing
      this.pendingMessages.push({ message, errorMessage });

      // If we don't have a client yet, start the connection
      if (!this.client) {
        console.log("Connecting to room (auto):", roomId);
        this.connect(roomId);
      }

      return;
    }

    try {
      this.client.send(message);
    } catch (error) {
      console.error(errorMessage, error);
    }
  }
}

export const roomStateService = RoomStateService.getInstance();
