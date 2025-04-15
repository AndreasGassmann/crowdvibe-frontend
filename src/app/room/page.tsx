"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RoomClient from "@/components/RoomClient";

function RoomContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("id");

  if (!roomId) {
    return <div>Room ID is required</div>;
  }

  return <RoomClient roomId={roomId} />;
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoomContent />
    </Suspense>
  );
}
