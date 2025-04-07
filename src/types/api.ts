export interface Message {
  id: string;
  room: number;
  user: number;
  username: string;
  message: string;
  created: string;
  updated: string;
}

export interface Proposal {
  id: number;
  room: number;
  round: string;
  user: number;
  username: string;
  text: string;
  vote_count: number;
  user_vote_id: number | null;
  created: string;
  updated: string;
}

export interface Room {
  id: number;
  name: string;
  created: string;
  updated: string;
}

export interface Vote {
  id: number;
  user: number;
  username: string;
  proposal: number;
  created: string;
  updated: string;
}

export interface Round {
  id: string;
  room: number;
  counter: number;
  duration: string;
  game: string | null;
  created: string;
  updated: string;
}

export interface Leaderboard {
  id: number;
  room: number;
  round: number;
  user: number;
  score: number;
  created: string;
  updated: string;
}
