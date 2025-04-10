"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { storage } from "@/lib/storage";
import UsernameModal from "@/components/username-modal";

type UserContextType = {
  username: string;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);

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
        setIsUsernameModalOpen(!storage.hasSetFirstname());
      } catch (error) {
        console.error("Failed to initialize user:", error);
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const handleSaveUsername = async (newFirstname: string) => {
    try {
      // Update the first_name in the API
      console.log("Updating username:", newFirstname);
      // await api.updateUsername(newFirstname);
      storage.setFirstnameSet(true);
      setIsUsernameModalOpen(false);
    } catch (error) {
      console.error("Failed to update first name:", error);
      // If update fails, show the modal again
      setIsUsernameModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ username, isLoading }}>
      {children}
      <UsernameModal
        isOpen={isUsernameModalOpen}
        onClose={() => setIsUsernameModalOpen(false)}
        onSave={handleSaveUsername}
        title="Set Your Name"
        description="Please enter your name to personalize your experience"
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
