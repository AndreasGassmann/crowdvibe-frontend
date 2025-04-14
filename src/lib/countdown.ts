import { Round } from "@/types/api";

export function calculateTimeLeft(round: Round | null): string {
  if (!round) return "";

  const now = new Date();
  const startTime = new Date(round.created);

  // Parse duration in hh:mm:ss format
  const [hours, minutes, seconds] = round.duration.split(":").map(Number);
  const durationInMs = ((hours * 60 + minutes) * 60 + seconds) * 1000;
  const endTime = new Date(startTime.getTime() + durationInMs);
  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) {
    return "Round ended";
  }

  const remainingHours = Math.floor(diff / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSeconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`;
}

export function calculateSecondsLeft(round: Round | null): number {
  if (!round) return 0;

  const now = new Date();
  const startTime = new Date(round.created);

  // Parse duration in hh:mm:ss format
  const [hours, minutes, seconds] = round.duration.split(":").map(Number);
  const durationInMs = ((hours * 60 + minutes) * 60 + seconds) * 1000;
  const endTime = new Date(startTime.getTime() + durationInMs);
  const diff = endTime.getTime() - now.getTime();

  // Return actual value (can be negative) instead of clamping to zero
  return Math.floor(diff / 1000);
}
