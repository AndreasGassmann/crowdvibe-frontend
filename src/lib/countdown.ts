import { Round } from "@/types/api";

export function calculateTimeLeft(round: Round | null): string {
  if (!round) return "";

  const now = new Date();
  const startTime = new Date(round.created);

  // Parse duration in dd:hh:mm format
  const [days, hours, minutes] = round.duration.split(":").map(Number);
  const durationInMs = ((days * 24 + hours) * 60 + minutes) * 60 * 1000;
  const endTime = new Date(startTime.getTime() + durationInMs);
  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) {
    return "Round ended";
  }

  const remainingDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSeconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${remainingDays}d ${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`;
}

export function calculateSecondsLeft(round: Round | null): number {
  if (!round) return 0;

  const now = new Date();
  const startTime = new Date(round.created);

  // Parse duration in dd:hh:mm format
  const [days, hours, minutes] = round.duration.split(":").map(Number);
  const durationInMs = ((days * 24 + hours) * 60 + minutes) * 60 * 1000;
  const endTime = new Date(startTime.getTime() + durationInMs);
  const diff = endTime.getTime() - now.getTime();

  return Math.max(0, Math.floor(diff / 1000));
}
