"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { storage } from "@/lib/storage";
import UsernameModal from "@/components/username-modal";

type UserContextType = {
  userId: number;
  username: string;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<number>(-1);
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        const username = storage.getUsername();
        const password = storage.getPassword();

        // Only try to register if the username was autogenerated
        if (storage.isUsernameAutogenerated()) {
          try {
            await api.registerUser(username, password);
          } catch (error) {
            // If registration fails, it might mean the user already exists
            console.log("User might already exist, continuing...");
          }
        }

        // Get the user ID
        const id = await api.getUserProfile();
        setUserId(id);
        setUsername(username);

        // Only show the modal if the username was autogenerated
        if (storage.isUsernameAutogenerated()) {
          setIsUsernameModalOpen(true);
        }
      } catch (error) {
        console.error("Failed to initialize user:", error);
        // storage.clearCredentials();
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const handleSaveUsername = async (newUsername: string) => {
    try {
      // Update the username in the API
      await api.updateUsername(newUsername);

      // Update the credentials in storage
      storage.setCredentials(newUsername, storage.getPassword());
      setUsername(newUsername);
    } catch (error) {
      console.error("Failed to update username:", error);
      // If update fails, show the modal again
      setIsUsernameModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ userId, username, isLoading }}>
      {children}
      <UsernameModal
        isOpen={isUsernameModalOpen}
        onClose={() => setIsUsernameModalOpen(false)}
        onSave={handleSaveUsername}
      />
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
