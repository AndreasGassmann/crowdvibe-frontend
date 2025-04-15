// components/settings-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PromptHistoryTab from "@/components/prompt-history-tab";
import GameHistoryTab from "@/components/game-history-tab";
import AboutTab from "@/components/about-tab";
import ProfileSettingsTab from "@/components/profile-settings-tab";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Settings</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="profile"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="prompt-history">Prompt History</TabsTrigger>
            <TabsTrigger value="game-history">Game History</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="profile" className="h-full">
              <ProfileSettingsTab />
            </TabsContent>

            <TabsContent value="prompt-history" className="h-full">
              <PromptHistoryTab />
            </TabsContent>

            <TabsContent value="game-history" className="h-full">
              <GameHistoryTab />
            </TabsContent>

            <TabsContent value="about" className="h-full">
              <AboutTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
