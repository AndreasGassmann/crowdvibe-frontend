import { Metadata } from "next";
import RoomClient from "./RoomClient";

export const metadata: Metadata = {
  title: "Room",
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RoomPage(props: Props) {
  const { id } = await props.params;
  return <RoomClient roomId={id} />;
}
