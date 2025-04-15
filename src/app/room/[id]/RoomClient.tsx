"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import GameDisplay from "@/components/game-display";
import SidePanel from "@/components/side-panel";
import RoundChangePopup from "@/components/round-change-popup";
import { Round } from "@/types/api";
import { useLoading } from "@/contexts/loading-context";
import { storage } from "@/lib/storage";
import { roomStateService } from "@/lib/room-state-service";
import { calculateSecondsLeft } from "@/lib/countdown";
import { useNotifications } from "@/hooks/useNotifications";
import { api } from "@/lib/api";

export default function RoomClient({ roomId }: { roomId: string }) {
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const previousRoundCounter = useRef<number | null>(null);
  const router = useRouter();
  const { isLoading, setIsLoading, isAuthenticated, setIsAuthenticated } =
    useLoading();
  const { permission, requestPermission, showNotification } =
    useNotifications();

  // Request notification permission on load
  useEffect(() => {
    if (permission === "default") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Subscribe to room state updates
  useEffect(() => {
    const subscription = roomStateService.getState().subscribe((state) => {
      if (state.currentRound) {
        previousRoundCounter.current = state.currentRound.counter;
      }
      setCurrentRound(state.currentRound);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Calculate time left based on currentRound
  useEffect(() => {
    const updateTimer = () => {
      setTimeLeft(calculateSecondsLeft(currentRound));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentRound]);

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
      } catch (error) {
        console.error("Failed to initialize user:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [setIsLoading, setIsAuthenticated, router]);

  // Connect to room when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const connectToRoom = async () => {
      try {
        setIsLoading(true);
        roomStateService.connect(roomId);
      } catch (error) {
        console.error("Failed to connect to room:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    connectToRoom();
  }, [isAuthenticated, setIsLoading, roomId, router]);

  const handleLeaveRoom = () => {
    roomStateService.disconnect();
    router.push("/");
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="flex flex-col flex-1">
        <Header
          currentRound={currentRound}
          timeLeft={timeLeft}
          onLeaveRoom={handleLeaveRoom}
        />
        <div className="flex-1 p-4">
          <GameDisplay currentRound={currentRound} />
        </div>
      </div>
      <div className="w-[400px] border-l border-gray-200 dark:border-gray-800">
        <SidePanel timeLeft={timeLeft} showNotification={showNotification} />
      </div>
      <RoundChangePopup
        currentRound={currentRound}
        previousRoundCounter={previousRoundCounter.current}
      />
    </div>
  );
}
