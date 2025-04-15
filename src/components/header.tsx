// components/header.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import SettingsModal from "@/components/settings-modal";
import { Round } from "@/types/api";

interface HeaderProps {
  currentRound: Round | null;
  timeLeft: number;
}

export default function Header({ currentRound, timeLeft }: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const formatTime = (seconds: number) => {
    if (seconds < 0) return "Generating...";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 h-20 flex-shrink-0">
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="relative h-10 w-10">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                CV
              </div>
            </div>
          </div>

          <Card className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center mr-2">
                <p className="text-xs font-medium">Round</p>
                <p className="text-sm font-bold">
                  {currentRound ? currentRound.counter : "-"}
                </p>
              </div>
              <div className="h-8 w-px bg-white/30"></div>
              <div className="flex flex-col">
                <p className="text-xs font-medium">Next Round</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              aria-label="Settings"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
