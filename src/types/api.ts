export interface Message {
  id: string;
  room: string;
  user: number;
  username: string;
  message: string;
  created: string;
  updated: string;
}

export interface Proposal {
  id: string;
  room: string;
  user: number;
  username: string;
  text: string;
  vote_count: number;
  user_vote_id: string | null;
  created: string;
  updated: string;
}

export interface Room {
  id: string;
  name: string;
  created: string;
  updated: string;
}

export interface Vote {
  id: string;
  user: number;
  username: string;
  proposal: string;
  created: string;
  updated: string;
}

export interface Round {
  id: string;
  room: string;
  counter: number;
  duration: string;
  game: string | null;
  created: string;
  updated: string;
}

export interface Leaderboard {
  id: string;
  room: string;
  round: string;
  user: number;
  score: number;
  created: string;
  updated: string;
}
