// components/game-display.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface GameDisplayProps {
  gameName?: string;
}

export default function GameDisplay({
  gameName = "sample-game",
}: GameDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array since we don't need to react to gameName changes

  return (
    <Card className="flex-1 flex flex-col h-full dark:border-gray-800">
      <CardContent className="p-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 dark:border-purple-500"></div>
          </div>
        ) : (
          <div className="w-full h-full">
            <iframe
              src={`/games/${gameName}.html`}
              className="w-full h-full border-0"
              title="Game"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
