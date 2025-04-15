import RoomClient from "./RoomClient";

// Disable static generation for this route
export const dynamic = "force-dynamic";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoomClient roomId={id} />;
}
