// components/header.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Header() {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 h-16 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative h-10 w-10 mr-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              CV
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            CrowdVibe
          </h1>
        </div>

        <Card className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <div className="text-center">
            <p className="text-xs font-medium mb-1">Next Update In</p>
            <p className="text-xl font-bold tabular-nums">
              {formatTime(timeLeft)}
            </p>
          </div>
        </Card>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </Button>

          <ThemeToggle />

          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
