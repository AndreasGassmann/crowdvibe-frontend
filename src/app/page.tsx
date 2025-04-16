// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Room } from "@/types/api";
import { api } from "@/lib/api";
import { storage } from "@/lib/storage";
import { useLoading } from "@/contexts/loading-context";

const LLM_MODELS = [
  { id: "google/gemini-2.5-pro-preview-03-25", name: "Gemini 2.5 Pro" },
  { id: "google/gemini-2.5-pro-exp-03-25:free", name: "Gemini 2.5 Pro (Free)" },
  { id: "openai/gpt-4.1-mini", name: "GPT-4.1 Mini" },
  { id: "openai/o3-mini-high", name: "O3 Mini High" },
  { id: "openai/gpt-4.1-nano", name: "GPT-4.1 Nano" },
  { id: "deepseek/deepseek-r1-distill-qwen-1.5b", name: "DeepSeek R1" },
];

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(LLM_MODELS[0].id);
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
        } else if (!storage.isUserRegistered()) {
          // Register existing credentials if not registered
          await api.registerUser(username, password);
        }

        setIsAuthenticated(true);
        await fetchRooms();
      } catch (error) {
        console.error("Failed to initialize user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [setIsLoading, setIsAuthenticated]);

  const fetchRooms = async () => {
    try {
      const rooms = await api.getRooms();
      setRooms(rooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  const handleCreateRoom = async () => {
    if (!initialPrompt.trim() || !roomName.trim()) return;

    try {
      setIsCreatingRoom(true);
      const newRoom = await api.createRoom(
        roomName.trim(),
        initialPrompt.trim(),
        selectedModel
      );
      await fetchRooms();
      setRoomName("");
      setInitialPrompt("");
      setSelectedModel(LLM_MODELS[0].id);
      router.push(`/room/${newRoom.id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 dark:border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to CrowdVibe
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Please register to start playing
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Available Rooms
          </h1>

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
                  {room.participant_count || 0} participants
                </p>
                {room.llm_model && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Model:{" "}
                    {LLM_MODELS.find((m) => m.id === room.llm_model)?.name ||
                      room.llm_model}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Room
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {LLM_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateRoom}
                disabled={
                  isCreatingRoom || !initialPrompt.trim() || !roomName.trim()
                }
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                placeholder="Enter a prompt to generate a game..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[100px]"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
