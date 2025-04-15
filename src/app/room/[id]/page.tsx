import RoomClient from "./RoomClient";

// Disable static generation for this route
export const dynamic = "force-dynamic";

export default function RoomPage({ params }: { params: { id: string } }) {
  return <RoomClient roomId={params.id} />;
}
