// Data stored in the Durable Object storage
export type RoomState = {
  villainName: string;
  villainType: string;
  totalHits: number;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: number;
};

// --- LEADERBOARD TYPES ---

export type GeoLocation = {
  country: string; // e.g., "CN", "US"
  region: string;  // e.g., "BJ" (Beijing), "CA" (California)
  city?: string;   // e.g., "Chaoyang"
};

export type LeaderboardEntry = {
  id: string; // Country Code or Region Code
  name: string; // Display Name
  score: number;
};

export type GlobalLeaderboardState = {
  [countryCode: string]: {
    name: string; // Country Name
    score: number;
    regions: {
      [regionCode: string]: number; // Region score
    }
  }
};

// Messages sent FROM Client TO Server
export type ClientMessage = 
  | { type: 'INIT'; villainName: string; villainType: string } // Host initializes room
  | { type: 'HIT'; damage: number }                            // Someone hits
  | { type: 'EMOJI'; emoji: string }                           // Someone sends reaction
  | { type: 'LB_CLICK'; count: number };                       // Reporting clicks to leaderboard

// Messages sent FROM Server TO Client
export type ServerMessage = 
  | { type: 'SYNC'; state: RoomState; onlineCount: number }    // Initial sync / State update
  | { type: 'HIT_UPDATE'; damage: number; totalHits: number }  // Broadcast hit
  | { type: 'USER_JOINED'; count: number }                     // Presence update
  | { type: 'USER_LEFT'; count: number }                       // Presence update
  | { type: 'EMOJI_BROADCAST'; emoji: string; x: number; y: number } // Visual effect
  | { type: 'LB_UPDATE'; state: GlobalLeaderboardState };       // Leaderboard full update