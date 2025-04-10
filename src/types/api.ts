export interface Message {
  id: string;
  room: string;
  user: number;
  username: string;
  first_name: string;
  message: string;
  created: string;
  updated: string;
}

export interface Proposal {
  id: number;
  room: string;
  round: string;
  user: number;
  username: string;
  first_name: string;
  text: string;
  vote_count: number;
  user_vote_id: number | null;
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
  id: number;
  user: number;
  username: string;
  proposal: number;
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
  id: number;
  room: string;
  round: string;
  user: number;
  username: string;
  score: number;
  created: string;
  updated: string;
}
