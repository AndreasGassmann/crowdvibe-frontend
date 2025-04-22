"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Room } from "@/types/api";
import { api } from "@/lib/api";
import { storage } from "@/lib/storage";
import { useLoading } from "@/contexts/loading-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Changed component name for clarity
export default function RoomsListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State for modal
  const router = useRouter();
  const { isLoading, setIsLoading, isAuthenticated, setIsAuthenticated } =
    useLoading();

  // Check authentication status and register user if needed
  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        const username = storage.getUsername();
        const password = storage.getPassword();

        if (!username || !password) {
          // Generate new credentials if none exist
          const newUsername = `user_${Math.random()
            .toString(36)
            .substring(2, 8)}`;
          const newPassword = Math.random().toString(36).substring(2, 12);

          storage.setUsername(newUsername);
          storage.setPassword(newPassword);

          // Register the new user
          await api.registerUser(newUsername, newPassword);
          storage.setUserRegistered(true); // Mark as registered
        } else if (!storage.isUserRegistered()) {
          // Register existing credentials if not registered (e.g., migration)
          try {
            await api.registerUser(username, password);
            storage.setUserRegistered(true); // Mark as registered
          } catch (registerError: Error | unknown) {
            // Handle cases where registration might fail (e.g., user already exists with different password)
            console.warn(
              "Registration failed:",
              registerError instanceof Error
                ? registerError.message
                : String(registerError)
            );
            console.warn(
              "Generating new credentials after registration failure."
            );
            // Generate new credentials if registration fails
            const newUsername = `user_${Math.random()
              .toString(36)
              .substring(2, 8)}`;
            const newPassword = Math.random().toString(36).substring(2, 12);
            storage.setUsername(newUsername);
            storage.setPassword(newPassword);
            await api.registerUser(newUsername, newPassword);
            storage.setUserRegistered(true); // Mark as registered
          }
        }

        setIsAuthenticated(true);
        await fetchRooms();
      } catch (error) {
        console.error("Failed to initialize user:", error);
        setIsAuthenticated(false); // Ensure user is not marked authenticated on error
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed dependencies that might cause re-runs unnecessarily

  const fetchRooms = async () => {
    try {
      const fetchedRooms = await api.getRooms();
      setRooms(fetchedRooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setRooms([]); // Clear rooms on error
    }
  };

  const handleCreateRoom = async () => {
    if (!initialPrompt.trim() || !roomName.trim()) return;

    try {
      setIsCreatingRoom(true);
      const newRoom = await api.createRoom(
        roomName.trim(),
        initialPrompt.trim()
      );
      setRoomName("");
      setInitialPrompt("");
      setIsCreateModalOpen(false); // Close modal on success
      // Update route to use query parameter
      router.push(`/room?id=${newRoom.id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      // Potentially show an error message to the user here
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    // Update route to use query parameter
    router.push(`/room?id=${roomId}`);
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 dark:border-purple-500"></div>
        </div>
      </div>
    );
  }

  // Display message if authentication failed or is pending
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Authenticating...
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Please wait while we set things up. If this takes too long, try
              refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main room list UI
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Available Rooms
          </h1>

          {/* Room List - Changed to ul/li */}
          {rooms.length > 0 ? (
            <ul className="space-y-3 mb-8">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center"
                  onClick={() => handleJoinRoom(room.id)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {room.name}
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {room.participant_count ?? 0} participants
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
              No rooms available yet.
            </p>
          )}

          {/* Create New Room Button and Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">Create New Room</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">
                  Create New Room
                </DialogTitle>
                <DialogDescription>
                  Enter a name and an initial prompt for your new room. The
                  prompt guides the game generation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="roomName"
                    className="text-right text-gray-700 dark:text-gray-300"
                  >
                    Room Name
                  </Label>
                  <Input
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g., Epic Debate Club"
                    className="col-span-3 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label
                    htmlFor="initialPrompt"
                    className="text-right pt-2 text-gray-700 dark:text-gray-300"
                  >
                    Initial Prompt
                  </Label>
                  <Textarea
                    id="initialPrompt"
                    value={initialPrompt}
                    onChange={(e) => setInitialPrompt(e.target.value)}
                    placeholder="e.g., A debate about the best pizza toppings"
                    className="col-span-3 min-h-[100px] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button" // Changed type to button as it's not submitting a standard form
                  onClick={handleCreateRoom}
                  disabled={
                    isCreatingRoom || !initialPrompt.trim() || !roomName.trim()
                  }
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  {isCreatingRoom ? "Creating..." : "Create Room"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
