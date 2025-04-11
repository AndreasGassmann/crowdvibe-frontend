// ==========================
// Frontend -> Backend Payloads (Action Types)
// ==========================

export interface ChatAction {
  type: "chat_action";
  message: string;
}

export interface LeaderboardAction {
  type: "leaderboard_action";
  entry: number; // the score value to submit
}

export interface RoundAction {
  type: "round_action";
  round: string; // e.g. the new round game data/information
}

export interface ProposalAction {
  type: "proposal_action";
  proposal: string;
}

export interface VoteAction {
  type: "vote_action";
  proposal_id: number;
}

// Union type for all action payloads.
export type ActionPayload =
  | ChatAction
  | LeaderboardAction
  | RoundAction
  | ProposalAction
  | VoteAction;

// ==========================
// Backend -> Frontend Broadcast Events
// ==========================

export interface ChatBroadcast {
  type: "chat_broadcast";
  message: string;
  created: string; // ISO date string
  username: string;
  first_name: string;
  last_name: string;
}

export interface LeaderboardBroadcast {
  type: "leaderboard_broadcast";
  entry: number; // submitted score value
  score: number; // actual score saved (can be the same as entry)
  created: string; // ISO date string
  username: string;
  first_name: string;
  last_name: string;
}

export interface RoundBroadcast {
  type: "round_broadcast";
  round: string; // round game data/information
  counter: number;
  duration: string; // e.g., "0:01:00"
  created: string; // ISO date string
}

export interface ProposalBroadcast {
  type: "proposal_broadcast";
  proposal: string;
  created: string; // ISO date string
  username: string;
  first_name: string;
  last_name: string;
}

// Union type for broadcast events.
export type BroadcastEvent =
  | ChatBroadcast
  | LeaderboardBroadcast
  | RoundBroadcast
  | ProposalBroadcast;
