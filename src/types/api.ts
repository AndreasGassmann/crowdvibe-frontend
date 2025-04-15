export interface Message {
  id: string;
  room: string;
  user: number;
  username: string;
  first_name: string;
  message: string;
  created: string;
  updated: string;
  type?: "user" | "system";
}

export interface Proposal {
  id: string;
  room: string;
  round: string;
  user: number;
  username: string;
  first_name: string;
  text: string;
  vote_count: number;
  users_voted: string[];
  created: string;
  updated: string;
}

export interface Room {
  id: string;
  name: string;
  created: string;
  updated: string;
  participant_count?: number;
}

export interface Vote {
  id: string;
  user: number;
  username: string;
  proposal: number;
  created: string;
  updated: string;
}

export interface Round {
  id: string;
  roomId: string;
  counter: number;
  duration: string;
  game: string | null;
  gameUrl: string | null;
  created: string;
  updated: string;
}

export interface Leaderboard {
  id: string;
  room: string;
  round: string;
  user: number;
  username: string;
  first_name: string;
  score: number;
  tries: number;
  created: string;
  updated: string;
}
