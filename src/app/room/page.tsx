"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RoomClient from "@/components/RoomClient"; // Assuming this component handles displaying the room

// Renamed inner component for clarity
function RoomPageContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("id");

  if (!roomId) {
    // Handle missing room ID - maybe redirect or show an error
    // For now, showing a simple message
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 font-semibold">
          Room ID is missing in the URL.
        </p>
      </div>
    );
  }

  // Render the actual room client component with the ID
  return <RoomClient roomId={roomId} />;
}

// Export the main page component
export default function RoomPage() {
  return (
    // Suspense is good practice when using useSearchParams
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading Room...
        </div>
      }
    >
      <RoomPageContent />
    </Suspense>
  );
}
