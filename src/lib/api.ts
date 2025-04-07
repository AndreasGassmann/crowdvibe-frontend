import { Message, Proposal, Room, Vote } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = {
  // Messages
  getMessages: async (roomId: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/messages?roomId=${roomId}`);
    if (!response.ok) throw new Error("Failed to fetch messages");
    return response.json();
  },

  sendMessage: async (
    message: Omit<Message, "id" | "createdAt">
  ): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!response.ok) throw new Error("Failed to send message");
    return response.json();
  },

  // Proposals
  getProposals: async (roomId: string): Promise<Proposal[]> => {
    const response = await fetch(`${API_BASE_URL}/proposals?roomId=${roomId}`);
    if (!response.ok) throw new Error("Failed to fetch proposals");
    return response.json();
  },

  createProposal: async (
    proposal: Omit<Proposal, "id" | "createdAt" | "votes">
  ): Promise<Proposal> => {
    const response = await fetch(`${API_BASE_URL}/proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposal),
    });
    if (!response.ok) throw new Error("Failed to create proposal");
    return response.json();
  },

  // Rooms
  getRooms: async (): Promise<Room[]> => {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    if (!response.ok) throw new Error("Failed to fetch rooms");
    return response.json();
  },

  getRoom: async (roomId: string): Promise<Room> => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
    if (!response.ok) throw new Error("Failed to fetch room");
    return response.json();
  },

  // Votes
  vote: async (vote: Omit<Vote, "id" | "createdAt">): Promise<Vote> => {
    const response = await fetch(`${API_BASE_URL}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vote),
    });
    if (!response.ok) throw new Error("Failed to submit vote");
    return response.json();
  },
};
