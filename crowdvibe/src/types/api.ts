export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  description: string;
  type: "code" | "feature";
  votes: number;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  userId: string;
  createdAt: string;
}
