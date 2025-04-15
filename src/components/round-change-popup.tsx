"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Round } from "@/types/api";

interface RoundChangePopupProps {
  currentRound: Round | null;
  previousRoundCounter: number | null;
}

export default function RoundChangePopup({
  currentRound,
  previousRoundCounter,
}: RoundChangePopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentRound && currentRound.counter !== previousRoundCounter) {
      setIsOpen(true);
    }
  }, [currentRound, previousRoundCounter]);

  if (!currentRound) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Round {currentRound.counter} Started!</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">Have fun!</p>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
