import RoomClient from "./RoomClient";

// Disable static generation for this route
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

export default function RoomPage({ params }: PageProps) {
  return <RoomClient roomId={params.id} />;
}
