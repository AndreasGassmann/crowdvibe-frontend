// components/prompt-history-tab.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Code, MessageSquare, Clock } from "lucide-react";

type PromptItem = {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  votes: number;
  type: "code" | "feature";
  status: "pending" | "approved" | "rejected";
};

export default function PromptHistoryTab() {
  const [prompts, setPrompts] = useState<PromptItem[]>([
    {
      id: "1",
      content: "Add gravity to the game physics",
      author: "sarah_dev",
      timestamp: "2 days ago",
      votes: 24,
      type: "code",
      status: "approved",
    },
    {
      id: "2",
      content: "Create a scoring system",
      author: "game_master",
      timestamp: "3 days ago",
      votes: 18,
      type: "feature",
      status: "approved",
    },
    {
      id: "3",
      content: "Add colorful background",
      author: "pixel_artist",
      timestamp: "5 days ago",
      votes: 15,
      type: "feature",
      status: "approved",
    },
    {
      id: "4",
      content: "Implement collision detection",
      author: "coder42",
      timestamp: "1 week ago",
      votes: 32,
      type: "code",
      status: "approved",
    },
    {
      id: "5",
      content: "Add sound effects for jumping",
      author: "audio_wizard",
      timestamp: "1 week ago",
      votes: 9,
      type: "feature",
      status: "pending",
    },
  ]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        View the history of all prompts and suggestions submitted to the game.
      </p>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {prompts.map((prompt) => (
          <Card
            key={prompt.id}
            className="p-4 dark:border-gray-800 dark:bg-gray-800/50"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium dark:text-white">
                  @{prompt.author}
                </span>
                <Badge
                  variant={
                    prompt.status === "approved"
                      ? "default"
                      : prompt.status === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {prompt.status}
                </Badge>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <Clock className="h-3 w-3 mr-1" />
                {prompt.timestamp}
              </div>
            </div>

            <p className="text-sm mb-3 dark:text-gray-300">{prompt.content}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {prompt.votes}
                </div>
                {prompt.type === "code" ? (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-purple-500 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800"
                  >
                    <Code className="h-3 w-3" />
                    <span>Code</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-pink-500 border-pink-200 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-800"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Feature</span>
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
