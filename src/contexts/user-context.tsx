"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { storage } from "@/lib/storage";
import { useLoading } from "./loading-context";

type UserContextType = {
  username: string;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string>("");
  const { setIsLoading, setIsAuthenticated } = useLoading();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        const username = storage.getUsername();
        const password = storage.getPassword();

        if (!username || !password) {
          console.warn("No username/password found in storage during init.");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Try to register if not already registered
        if (!storage.isUserRegistered()) {
          try {
            await api.registerUser(username, password);
            storage.setUserRegistered(true);
          } catch (error) {
            console.log(
              "User registration failed (might already exist):",
              error
            );
            storage.setUserRegistered(true);
          }
        }

        setUsername(username);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize user:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [setIsLoading, setIsAuthenticated]);

  return (
    <UserContext.Provider value={{ username }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
