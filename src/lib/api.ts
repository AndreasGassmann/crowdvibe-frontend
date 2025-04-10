"use client";

import { Room } from "@/types/api";
import { storage } from "./storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://crowdvibe.lukeisontheroad.com/api/v1";

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
        first_name: storage.getFirstname() || "",
        password,
        email: `${username}@crowdvibe.com`, // Generate a dummy email
      }),
    });
    if (!response.ok) throw new Error("Failed to register user");

    // Set the registered flag and firstname flag after successful registration
    storage.setUserRegistered(true);
    storage.setFirstnameSet(false);
  },

  // Rooms
  getRooms: async (): Promise<Room[]> => {
    const response = await fetch(`${API_BASE_URL}/rooms/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch rooms");
    return response.json();
  },
};
