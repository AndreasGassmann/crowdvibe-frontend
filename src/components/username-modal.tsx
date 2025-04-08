"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (firstname: string) => void;
  title?: string;
  description?: string;
}

export default function UsernameModal({
  isOpen,
  onClose,
  onSave,
  title = "Welcome to CrowdVibe",
  description = "Please choose a username to personalize your experience",
}: UsernameModalProps) {
  const [firstname, setFirstname] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstname.trim()) {
      onSave(firstname.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">{title}</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="firstname" className="dark:text-gray-300">
              Name
            </Label>
            <Input
              id="firstname"
              type="text"
              placeholder="Enter your name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
              className="dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
