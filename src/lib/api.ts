"use client";

import { Message, Proposal, Room, Vote, Round } from "@/types/api";
import { storage } from "./storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://39a8-85-195-246-194.ngrok-free.app/api/v1";

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
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        email: `${username}@crowdvibe.com`, // Generate a dummy email
      }),
    });
    if (!response.ok) throw new Error("Failed to register user");
  },

  updateUsername: async (newUsername: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/update_username/`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        username: newUsername,
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
  getMessages: async (roomId: string): Promise<Message[]> => {
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
  getProposals: async (roomId: string): Promise<Proposal[]> => {
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

  getRoom: async (roomId: string): Promise<Room> => {
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
  getRounds: async (roomId: string): Promise<Round[]> => {
    const response = await fetch(`${API_BASE_URL}/rounds/?room=${roomId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch rounds");
    return response.json();
  },
};
