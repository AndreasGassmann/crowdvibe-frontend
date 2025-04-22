"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { storage } from "@/lib/storage";

type UserContextType = {
  username: string;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        const username = storage.getUsername();
        const password = storage.getPassword();

        // Try to register if not already registered
        if (!storage.isUserRegistered()) {
          try {
            if (!username || !password) {
              throw new Error("Username or password is missing");
            }
            await api.registerUser(username, password);
          } catch (error) {
            // If registration fails, it might mean the user already exists
            console.log("User might already exist, continuing...", error);
          }
        }

        setUsername(username || "");
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize user:", error);
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  return (
    <UserContext.Provider value={{ username, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
