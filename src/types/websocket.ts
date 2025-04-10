// Payload sent when creating a new chat message
export interface CreateChatMessagePayload {
  message: string;
}

// Event format for a chat message received from the websocket
export interface ChatMessageEvent {
  message: string;
  created: string; // ISO format date string
  username: string;
  first_name: string;
  last_name: string;
}

// Base WebSocket message type
export type WebSocketMessage =
  | {
      type: "chat_message";
      message: string;
    }
  | {
      type: "broadcast_message";
      message: string;
      created: string; // ISO format date string
      username: string;
      first_name: string;
      last_name: string;
    }
  | {
      type: "get_proposals";
    }
  | {
      type: "proposals_update";
      proposals: Proposal[];
    }
  | {
      type: "get_rounds";
    }
  | {
      type: "rounds_update";
      rounds: Round[];
    }
  | {
      type: "get_leaderboard";
    }
  | {
      type: "leaderboard_update";
      leaderboard: Leaderboard[];
    }
  | {
      type: "create_proposal";
      text: string;
      round: string;
    }
  | {
      type: "vote";
      proposal: number;
    }
  | {
      type: "delete_vote";
      vote_id: number;
    };

// Types needed for the WebSocket messages
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
