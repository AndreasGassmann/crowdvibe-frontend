// components/game-display.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function GameDisplay() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading the game
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden dark:border-gray-800">
      <div className="flex items-center justify-between p-3 border-b dark:border-gray-800">
        <h2 className="font-semibold text-lg dark:text-white">Current Game</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>
      <CardContent className="p-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 dark:border-purple-500"></div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-950 p-4">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 dark:text-white">
                Game Placeholder
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This is where your game will be displayed.
              </p>
              <div className="w-64 h-64 mx-auto bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Game Canvas</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
