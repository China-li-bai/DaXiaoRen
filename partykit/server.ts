import type * as Party from "partykit/server";
import { ClientMessage, RoomState, ServerMessage, GlobalLeaderboardState, GeoLocation } from "./types";
import { getCountryName, getRegionName } from "./geo-mapping";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default class VillainSmashServer implements Party.Server {
  options: Party.ServerOptions = {
    hibernate: true,
  };

  broadcastTimer: ReturnType<typeof setTimeout> | null = null;
  pendingBroadcast: { type: 'LB_UPDATE'; state: GlobalLeaderboardState } | null = null;

  constructor(readonly party: Party.Room) {}

  broadcast(msg: ServerMessage, excludeIds: string[] = []) {
    this.party.broadcast(JSON.stringify(msg), excludeIds);
  }

  // --- REQUEST HANDLER (HTTP) ---
  async onRequest(req: Party.Request) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method === "GET") {
      // Differentiate between Leaderboard and Game Room
      if (this.party.id === 'global-leaderboard') {
          const lbState = await this.party.storage.get<GlobalLeaderboardState>("lb_state") || {};
          return new Response(JSON.stringify(lbState), { 
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
          });
      }

      const state = await this.party.storage.get<RoomState>("state");
      if (state) {
        return new Response(JSON.stringify(state), { 
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
        });
      }
      return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
    }

    return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
  }

  // --- CONNECTION HANDLER ---
  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // 1. GLOBAL LEADERBOARD LOGIC
    if (this.party.id === 'global-leaderboard') {
        // EXTRACT GEO INFO FROM CLOUDFLARE REQUEST
        // Fallback for localhost development
        const country = (ctx.request.cf?.country as string) || 'CN'; 
        const region = (ctx.request.cf?.region as string) || 'Unknown';
        const city = (ctx.request.cf?.city as string) || 'Unknown';

        // Store geo info on the connection object for later use
        conn.setState({ country, region, city });

        // Send current leaderboard state to the new user
        const lbState = await this.party.storage.get<GlobalLeaderboardState>("lb_state") || {};
        conn.send(JSON.stringify({ type: 'LB_UPDATE', state: lbState }));
        return;
    }

    // 2. REGULAR GAME ROOM LOGIC
    let state = await this.party.storage.get<RoomState>("state");
    const onlineCount = [...this.party.getConnections()].length;

    if (state) {
      const syncMsg: ServerMessage = { type: "SYNC", state, onlineCount };
      conn.send(JSON.stringify(syncMsg));
    }
    this.broadcast({ type: "USER_JOINED", count: onlineCount }, [conn.id]);
  }

  // --- DISCONNECT HANDLER ---
  async onClose(conn: Party.Connection) {
    if (this.party.id === 'global-leaderboard') return; // Don't track presence for leaderboard to save bandwidth

    const onlineCount = [...this.party.getConnections()].length;
    this.broadcast({ type: "USER_LEFT", count: onlineCount });
  }

  // --- MESSAGE HANDLER ---
  async onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message) as ClientMessage;

    // === GLOBAL LEADERBOARD LOGIC ===
    if (this.party.id === 'global-leaderboard') {
        if (data.type === 'LB_CLICK') {
            const count = data.count || 1;
            // Retrieve geo info we saved during onConnect
            const geo = sender.state as GeoLocation | null;
            
            if (geo && geo.country) {
                let lbState = await this.party.storage.get<GlobalLeaderboardState>("lb_state") || {};
                
                // Init Country if not exists
                if (!lbState[geo.country]) {
                    lbState[geo.country] = {
                        name: getCountryName(geo.country),
                        score: 0,
                        regions: {}
                    };
                }

                // Update Country Score
                lbState[geo.country].score += count;

                // Update Region Score
                const regionKey = geo.region || 'Unknown';
                if (!lbState[geo.country].regions[regionKey]) {
                    lbState[geo.country].regions[regionKey] = 0;
                }
                lbState[geo.country].regions[regionKey] += count;

                // Persist
                await this.party.storage.put("lb_state", lbState);

                // Throttled Broadcast Update (1 second delay to reduce bandwidth)
                this.pendingBroadcast = { type: 'LB_UPDATE', state: lbState };
                
                if (!this.broadcastTimer) {
                    this.broadcastTimer = setTimeout(() => {
                        if (this.pendingBroadcast) {
                            this.party.broadcast(JSON.stringify(this.pendingBroadcast));
                            this.pendingBroadcast = null;
                        }
                        this.broadcastTimer = null;
                    }, 1000);
                }
            }
        }
        return;
    }

    // === REGULAR GAME ROOM LOGIC ===
    if (data.type === 'INIT') {
      const newState: RoomState = {
        villainName: data.villainName,
        villainType: data.villainType,
        totalHits: 0,
        status: 'ACTIVE',
        createdAt: Date.now()
      };
      await this.party.storage.put("state", newState);
      this.broadcast({ type: 'SYNC', state: newState, onlineCount: [...this.party.getConnections()].length });
    }

    if (data.type === 'HIT') {
      let state = await this.party.storage.get<RoomState>("state");
      if (state && state.status === 'ACTIVE') {
        state.totalHits += 1;
        if (state.totalHits >= 10000) state.status = 'COMPLETED';
        await this.party.storage.put("state", state);
        this.broadcast({ type: 'HIT_UPDATE', damage: data.damage, totalHits: state.totalHits }, [sender.id]);
      }
    }

    if (data.type === 'EMOJI') {
        this.broadcast({
            type: 'EMOJI_BROADCAST',
            emoji: data.emoji,
            x: Math.random(),
            y: Math.random()
        }, [sender.id]);
    }
  }
}