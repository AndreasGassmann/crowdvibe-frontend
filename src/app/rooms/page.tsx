"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Room } from "@/types/api";
import { api } from "@/lib/api";
import { storage } from "@/lib/storage";
import { useLoading } from "@/contexts/loading-context";

// Changed component name for clarity
export default function RoomsListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
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
  }, [setIsLoading, setIsAuthenticated]);

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
      // Update route to use query parameter
      router.push(`/room?id=${newRoom.id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
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

          {/* Room List */}
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleJoinRoom(room.id)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {room.participant_count ?? 0} participants{" "}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              No rooms available yet. Create one below!
            </p>
          )}

          {/* Create New Room Form */}
          <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Room
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleCreateRoom}
                disabled={
                  isCreatingRoom || !initialPrompt.trim() || !roomName.trim()
                }
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreatingRoom ? "Creating..." : "Create Room"}
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Initial Prompt (Required)
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter a prompt to generate a game. This will be used to create
                the game&apos;s scenario, rules, and objectives.
              </p>
              <textarea
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                placeholder="e.g., A debate about the best pizza toppings"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
