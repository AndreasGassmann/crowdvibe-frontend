// components/game-history-tab.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Download, ExternalLink } from "lucide-react";

type GameVersion = {
  id: string;
  version: string;
  date: string;
  changes: string[];
  contributors: number;
  size: string;
};

export default function GameHistoryTab() {
  const gameVersions: GameVersion[] = [
    {
      id: "1",
      version: "v1.0.0",
      date: "Apr 5, 2023",
      changes: [
        "Initial game release",
        "Basic movement controls",
        "Simple collision detection",
      ],
      contributors: 5,
      size: "128 KB",
    },
    {
      id: "2",
      version: "v1.1.0",
      date: "Apr 12, 2023",
      changes: [
        "Added gravity physics",
        "Improved collision detection",
        "Added basic scoring system",
      ],
      contributors: 8,
      size: "156 KB",
    },
    {
      id: "3",
      version: "v1.2.0",
      date: "Apr 19, 2023",
      changes: [
        "Added colorful background",
        "Implemented sound effects",
        "Fixed jumping bug",
        "Added mobile controls",
      ],
      contributors: 12,
      size: "210 KB",
    },
    {
      id: "4",
      version: "v1.3.0 (Current)",
      date: "Apr 26, 2023",
      changes: [
        "Added enemy characters",
        "Implemented level progression",
        "Added power-ups",
        "Optimized performance",
      ],
      contributors: 15,
      size: "245 KB",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Browse through previous versions of the game and see how it has evolved.
      </p>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {gameVersions.map((version) => (
          <Card
            key={version.id}
            className="p-4 dark:border-gray-800 dark:bg-gray-800/50"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold dark:text-white">
                    {version.version}
                  </h3>
                  {version.version.includes("Current") && (
                    <Badge className="bg-green-500">Current</Badge>
                  )}
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{version.date}</span>
                  <span className="mx-2">•</span>
                  <span>{version.contributors} contributors</span>
                  <span className="mx-2">•</span>
                  <span>{version.size}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span>Play</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="h-3 w-3 mr-1" />
                  <span>Download</span>
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 dark:text-white">
                Changes:
              </h4>
              <ul className="text-sm space-y-1 list-disc pl-5 dark:text-gray-300">
                {version.changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
