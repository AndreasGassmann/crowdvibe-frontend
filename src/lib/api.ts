"use client";

import { Message, Proposal, Room, Vote, Round, Leaderboard } from "@/types/api";
import { storage } from "./storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://dev.lukeisontheroad.com/api/v1";

const getHeaders = () => {
  const username = storage.getUsername();
  const password = storage.getPassword();

  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${btoa(`${username}:${password}`)}`,
  };
};

export const api = {
  // User Profile
  registerUser: async (username: string, password: string): Promise<void> => {
    if (storage.isUserRegistered()) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        first_name: username,
        password,
        email: `${username}@crowdvibe.com`, // Generate a dummy email
      }),
    });
    if (!response.ok) throw new Error("Failed to register user");

    // Set the registered flag and firstname flag after successful registration
    storage.setUserRegistered(true);
    storage.setFirstnameSet(false);
  },

  updateUsername: async (newFirstname: string): Promise<void> => {
    // First get the user ID
    const userId = await api.getUserProfile();

    const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        first_name: newFirstname,
      }),
    });
    if (!response.ok) throw new Error("Failed to update username");
  },

  getUserProfile: async (): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch user profile");
    const data = await response.json();
    return data[0].id;
  },

  // Messages
  getMessages: async (roomId: number): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/messages/?room=${roomId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch messages");
    return response.json();
  },

  sendMessage: async (
    message: Omit<Message, "id" | "created" | "updated" | "username">,
    userId: number
  ): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/messages/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ ...message, user: userId }),
    });
    if (!response.ok) throw new Error("Failed to send message");
    return response.json();
  },

  // Proposals
  getProposals: async (roomId: number): Promise<Proposal[]> => {
    const response = await fetch(`${API_BASE_URL}/proposals/?room=${roomId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch proposals");
    return response.json();
  },

  createProposal: async (
    proposal: Omit<
      Proposal,
      "id" | "created" | "updated" | "username" | "vote_count" | "user_vote_id"
    >,
    userId: number
  ): Promise<Proposal> => {
    const response = await fetch(`${API_BASE_URL}/proposals/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ ...proposal, user: userId }),
    });
    if (!response.ok) throw new Error("Failed to create proposal");
    return response.json();
  },

  // Rooms
  getRooms: async (): Promise<Room[]> => {
    const response = await fetch(`${API_BASE_URL}/rooms/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch rooms");
    return response.json();
  },

  getRoom: async (roomId: number): Promise<Room> => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch room");
    return response.json();
  },

  // Votes
  vote: async (vote: { proposal: number; user: number }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/votes/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(vote),
    });
    if (!response.ok) throw new Error("Failed to vote");
  },

  deleteVote: async (voteId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/votes/${voteId}/`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete vote");
  },

  // Rounds
  getRounds: async (roomId: number): Promise<Round[]> => {
    const response = await fetch(`${API_BASE_URL}/rounds/?room=${roomId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch rounds");
    return response.json();
  },

  // Leaderboards
  getLeaderboards: async (roomId: number): Promise<Leaderboard[]> => {
    const response = await fetch(
      `${API_BASE_URL}/leaderboards/?room=${roomId}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch leaderboards");
    return response.json();
  },

  createLeaderboard: async (
    leaderboard: Omit<Leaderboard, "id" | "created" | "updated" | "username">,
    userId: number
  ): Promise<Leaderboard> => {
    const response = await fetch(`${API_BASE_URL}/leaderboards/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ ...leaderboard, user: userId }),
    });
    if (!response.ok) throw new Error("Failed to create leaderboard entry");
    return response.json();
  },

  updateLeaderboard: async (
    leaderboardId: number,
    leaderboard: Partial<Leaderboard>
  ): Promise<Leaderboard> => {
    const response = await fetch(
      `${API_BASE_URL}/leaderboards/${leaderboardId}/`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(leaderboard),
      }
    );
    if (!response.ok) throw new Error("Failed to update leaderboard entry");
    return response.json();
  },
};
