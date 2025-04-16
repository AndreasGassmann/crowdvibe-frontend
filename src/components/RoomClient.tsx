"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { roomStateService, RoomState } from "@/lib/room-state-service";
import { Room, Proposal, Round } from "@/types/api"; // Removed unused Message, Leaderboard for now
import { storage } from "@/lib/storage";
import { api } from "@/lib/api";
import { useLoading } from "@/contexts/loading-context"; // Import loading context
import { useNotifications } from "@/hooks/useNotifications"; // Import notifications hook
import { calculateSecondsLeft } from "@/lib/countdown"; // Import countdown util

// Import the UI components
import Header from "@/components/header";
import GameDisplay from "@/components/game-display";
import SidePanel from "@/components/side-panel";
// NOTE: RoundChangePopup might be better placed higher up (e.g., in layout.tsx or app/room/page.tsx) if it needs to overlay everything.
// For now, it's omitted here.

// Remove the old basic styles object
// const styles = { ... };

export default function RoomClient({ roomId }: { roomId: string }) {
  const router = useRouter();
  // Use loading/auth context state
  const { isLoading, setIsLoading, isAuthenticated, setIsAuthenticated } =
    useLoading();
  const [room, setRoom] = useState<Room | null>(null);
  const [roomState, setRoomState] = useState<RoomState>({
    messages: [],
    proposals: [],
    currentRound: null,
    leaderboard: [],
  });
  const [timeLeft, setTimeLeft] = useState<number>(0); // State for countdown timer
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null); // Keep for SidePanel if it needs it

  // Registration State (still needed locally to trigger registration)
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const username = storage.getUsername();
  const password = storage.getPassword();

  // Notifications hook
  const { permission, requestPermission, showNotification } =
    useNotifications();

  // Request notification permission on load (if not already granted/denied)
  useEffect(() => {
    if (permission === "default") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // --- Registration Logic ---
  const handleRegister = async () => {
    if (!username || !password) {
      setRegistrationError("Username or password missing. Please refresh.");
      return;
    }
    setIsRegistering(true);
    setRegistrationError(null);
    try {
      await api.registerUser(username, password);
      storage.setUserRegistered(true);
      setIsAuthenticated(true); // Update context state
      // No need to manually connect here, the useEffect below will handle it
    } catch (error) {
      console.error("Registration failed:", error);
      setRegistrationError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsRegistering(false);
    }
  };

  // --- WebSocket Connection and State Subscription (Runs when authenticated) ---
  useEffect(() => {
    // Only connect if authenticated via context
    if (!isAuthenticated) {
      setIsLoading(false); // Ensure loading is false if not authenticated
      return;
    }

    console.log(`RoomClient: Authenticated. Connecting to room ${roomId}`);
    setIsLoading(true);
    roomStateService.connect(roomId); // Connect using the passed roomId

    // Subscribe to current room details
    const roomSubscription = roomStateService
      .getCurrentRoom()
      .subscribe((currentRoom: Room | null) => {
        console.log("RoomClient: Received room update", currentRoom);
        setRoom(currentRoom);
        if (!currentRoom) {
          // Reset state if room becomes null (e.g., disconnected)
          setRoomState({
            messages: [],
            proposals: [],
            currentRound: null,
            leaderboard: [],
          });
        }
        // We might set loading false only after *both* room and initial state arrive
      });

    // Subscribe to detailed room state (chat, proposals, etc.)
    const stateSubscription = roomStateService
      .getState()
      .subscribe((newState: RoomState) => {
        console.log("RoomClient: Received room state update", newState);
        setRoomState(newState);
        setIsLoading(false); // Set loading false once state arrives
      });

    // Cleanup on unmount or if roomId/isAuthenticated changes
    return () => {
      console.log(
        "RoomClient: Cleaning up subscriptions and disconnecting",
        roomId
      );
      roomSubscription.unsubscribe();
      stateSubscription.unsubscribe();
      roomStateService.disconnect();
    };
    // Depend on isAuthenticated from context
  }, [roomId, isAuthenticated, setIsLoading]);

  // --- Calculate Time Left ---
  useEffect(() => {
    const updateTimer = () => {
      setTimeLeft(calculateSecondsLeft(roomState.currentRound));
    };

    updateTimer(); // Initial calculation
    const interval = setInterval(updateTimer, 1000); // Update every second

    // Cleanup interval on unmount or when round changes
    return () => clearInterval(interval);
  }, [roomState.currentRound]);

  // --- Event Handlers (Leave Room) ---
  const handleLeaveRoom = () => {
    router.push("/"); // Navigate home, useEffect cleanup handles disconnect
  };

  // --- RENDER LOGIC ---

  // 1. Show registration prompt if not authenticated
  // Use context's isAuthenticated instead of local isRegistered
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center p-4">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          Register to Join Room
        </h2>
        <p className="mb-4 dark:text-gray-300">You need to register first.</p>
        {registrationError && (
          <p className="mb-4 text-red-600 dark:text-red-400">
            Error: {registrationError}
          </p>
        )}
        <button
          onClick={handleRegister}
          disabled={isRegistering}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isRegistering ? "Registering..." : `Register as ${username}`}
        </button>
      </div>
    );
  }

  // 2. Show loading state (using context isLoading)
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          {/* Improved loading spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="ml-4 text-gray-600 dark:text-gray-400">
            Connecting to room...
          </p>
        </div>
      </div>
    );
  }

  // 3. Show room not found error state (if authenticated but room is null after loading)
  if (!room) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center p-4">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Error</h2>
        <p className="mb-4 dark:text-gray-300">
          Room not found or unable to connect.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  // 4. Render the main room UI using the new structure
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Main content area including Header and GameDisplay */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Pass room name, round, time left, and leave handler to Header */}
        <Header
          roomName={room.name}
          currentRound={roomState.currentRound}
          timeLeft={timeLeft}
          onLeaveRoom={handleLeaveRoom} // Pass the handler function
        />
        {/* Main game display area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <GameDisplay currentRound={roomState.currentRound} />
        </div>
      </div>

      {/* Sidebar panel */}
      <div className="w-[400px] border-l border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Pass necessary state/functions to SidePanel */}
        {/* Assuming SidePanel now handles Chat, Leaderboard etc. */}
        {/* It likely needs roomState (messages, leaderboard) and maybe sendMessage */}
        <SidePanel
          roomState={roomState}
          sendMessage={roomStateService.sendMessage}
          timeLeft={timeLeft} // Pass timeLeft if needed in SidePanel
          showNotification={showNotification} // Pass notification function
          chatMessagesEndRef={chatMessagesEndRef} // Pass ref if SidePanel manages chat scroll
        />
      </div>
      {/* 
        Consider where RoundChangePopup should live. If it needs to overlay 
        the whole screen, it might be better in layout.tsx or app/room/page.tsx 
        and listen to roomStateService directly or via context.
      */}
      {/* <RoundChangePopup
        currentRound={roomState.currentRound}
        previousRoundCounter={previousRoundCounter.current} // Need to manage previousRoundCounter ref
      /> */}
    </div>
  );
}
