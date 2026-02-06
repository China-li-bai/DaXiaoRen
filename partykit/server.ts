import type * as Party from "partykit/server";
import { ClientMessage, RoomState, ServerMessage, GlobalLeaderboardState, CountryData, LeaderboardMetadata, GeoLocation } from "./types";
import { getCountryName, getRegionName } from "./geo-mapping";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const LEADERBOARD_VERSION = "v1.0";
const DATA_RESET_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export default class VillainSmashServer implements Party.Server {
  options: Party.ServerOptions = {
    hibernate: true,
  };

  broadcastTimer: ReturnType<typeof setTimeout> | null = null;
  pendingBroadcast: { type: 'LB_UPDATE'; state: GlobalLeaderboardState } | null = null;
  leaderboardMetadata: LeaderboardMetadata | null = null;

  constructor(readonly party: Party.Room) {}

  async initializeLeaderboardMetadata() {
    let metadata = await this.party.storage.get<LeaderboardMetadata>("lb_metadata");
    
    if (!metadata) {
      metadata = {
        version: LEADERBOARD_VERSION,
        lastReset: Date.now(),
        totalGlobalClicks: 0,
        createdAt: Date.now()
      };
      await this.party.storage.put("lb_metadata", metadata);
    }
    
    this.leaderboardMetadata = metadata;
    
    return metadata;
  }

  async updateLeaderboardMetadata(updates: Partial<LeaderboardMetadata>) {
    if (!this.leaderboardMetadata) {
      await this.initializeLeaderboardMetadata();
    }
    
    this.leaderboardMetadata = {
      ...this.leaderboardMetadata,
      ...updates
    };
    
    await this.party.storage.put("lb_metadata", this.leaderboardMetadata);
  }

  async resetLeaderboardIfNeeded() {
    const metadata = await this.initializeLeaderboardMetadata();
    const now = Date.now();
    
    if (now - metadata.lastReset > DATA_RESET_INTERVAL) {
      console.log("Resetting leaderboard data...");
      
      const lbState = await this.party.storage.get<GlobalLeaderboardState>("lb_state") || {};
      
      for (const countryCode in lbState) {
        lbState[countryCode].score = 0;
        lbState[countryCode].totalClicks = 0;
        for (const regionCode in lbState[countryCode].regions) {
          lbState[countryCode].regions[regionCode] = 0;
        }
      }
      
      await this.party.storage.put("lb_state", lbState);
      await this.updateLeaderboardMetadata({
        lastReset: now,
        totalGlobalClicks: 0
      });
    }
  }

  broadcast(msg: ServerMessage, excludeIds: string[] = []) {
    this.party.broadcast(JSON.stringify(msg), excludeIds);
  }

  // --- REQUEST HANDLER (HTTP) ---
  async onRequest(req: Party.Request) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method === "GET") {
      if (this.party.id === 'global-leaderboard') {
          const lbState = await this.party.storage.get<GlobalLeaderboardState>("lb_state") || {};
          const metadata = await this.initializeLeaderboardMetadata();
          
          return new Response(JSON.stringify({ 
            leaderboard: lbState,
            metadata: metadata
          }), { 
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
    if (this.party.id === 'global-leaderboard') {
        await this.resetLeaderboardIfNeeded();
        
        const country = (ctx.request.cf?.country as string) || 'CN'; 
        const region = (ctx.request.cf?.region as string) || 'Unknown';
        const city = (ctx.request.cf?.city as string) || 'Unknown';

        conn.setState({ country, region, city });

        let lbState = await this.party.storage.get<GlobalLeaderboardState>("lb_state");
        
        // Initialize with sample data if empty
        if (!lbState || Object.keys(lbState).length === 0) {
          lbState = {
            'CN': {
              name: 'China',
              score: 1234567,
              regions: {
                'BJ': 456789,
                'SH': 345678,
                'GD': 234567,
                'ZJ': 123456,
                'JS': 98765
              },
              lastUpdated: Date.now(),
              totalClicks: 1234567
            },
            'US': {
              name: 'United States',
              score: 987654,
              regions: {
                'CA': 234567,
                'NY': 123456,
                'TX': 98765,
                'FL': 76543,
                'WA': 65432
              },
              lastUpdated: Date.now(),
              totalClicks: 987654
            },
            'JP': {
              name: 'Japan',
              score: 654321,
              regions: {
                '13': 234567,
                '27': 123456,
                '40': 98765,
                '23': 87654,
                '14': 76543
              },
              lastUpdated: Date.now(),
              totalClicks: 654321
            },
            'GB': {
              name: 'United Kingdom',
              score: 432109,
              regions: {
                'ENG': 234567,
                'SCT': 87654,
                'WLS': 54321,
                'NIR': 32109,
                'HMF': 12345
              },
              lastUpdated: Date.now(),
              totalClicks: 432109
            },
            'DE': {
              name: 'Germany',
              score: 321098,
              regions: {
                'NW': 87654,
                'BY': 76543,
                'BW': 65432,
                'NI': 54321,
                'HE': 32109
              },
              lastUpdated: Date.now(),
              totalClicks: 321098
            },
            'FR': {
              name: 'France',
              score: 287654,
              regions: {
                'IDF': 98765,
                'PAC': 76543,
                'HDF': 54321,
                'NOR': 43210,
                'GES': 32109
              },
              lastUpdated: Date.now(),
              totalClicks: 287654
            },
            'KR': {
              name: 'South Korea',
              score: 234567,
              regions: {
                '11': 98765,
                '41': 65432,
                '26': 32109,
                '28': 23456,
                '27': 12345
              },
              lastUpdated: Date.now(),
              totalClicks: 234567
            },
            'CA': {
              name: 'Canada',
              score: 198765,
              regions: {
                'ON': 87654,
                'QC': 65432,
                'BC': 32109,
                'AB': 8765,
                'MB': 4321
              },
              lastUpdated: Date.now(),
              totalClicks: 198765
            },
            'AU': {
              name: 'Australia',
              score: 165432,
              regions: {
                'NSW': 65432,
                'VIC': 54321,
                'QLD': 32109,
                'WA': 8765,
                'SA': 4321
              },
              lastUpdated: Date.now(),
              totalClicks: 165432
            },
            'BR': {
              name: 'Brazil',
              score: 143210,
              regions: {
                'SP': 65432,
                'RJ': 43210,
                'MG': 23456,
                'RS': 6543,
                'PR': 4321
              },
              lastUpdated: Date.now(),
              totalClicks: 143210
            }
          };
          
          await this.party.storage.put("lb_state", lbState);
          await this.updateLeaderboardMetadata({
            totalGlobalClicks: 4657372
          });
        }
        
        const metadata = this.leaderboardMetadata;
        
        conn.send(JSON.stringify({ 
          type: 'LB_UPDATE', 
          state: lbState,
          metadata: metadata
        }));
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
            const geo = sender.state as GeoLocation | null;
            
            if (geo && geo.country) {
                let lbState = await this.party.storage.get<GlobalLeaderboardState>("lb_state") || {};
                
                if (!lbState[geo.country]) {
                    lbState[geo.country] = {
                        name: getCountryName(geo.country),
                        score: 0,
                        regions: {},
                        lastUpdated: Date.now(),
                        totalClicks: 0
                    };
                }

                const countryData = lbState[geo.country];
                countryData.score += count;
                countryData.totalClicks += count;
                countryData.lastUpdated = Date.now();

                const regionKey = geo.region || 'Unknown';
                if (!countryData.regions[regionKey]) {
                    countryData.regions[regionKey] = 0;
                }
                countryData.regions[regionKey] += count;

                await this.party.storage.put("lb_state", lbState);
                await this.updateLeaderboardMetadata({
                    totalGlobalClicks: (this.leaderboardMetadata?.totalGlobalClicks || 0) + count
                });

                this.pendingBroadcast = { type: 'LB_UPDATE', state: lbState, metadata: this.leaderboardMetadata };
                
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

    if (data.type === 'COMPLETION') {
        let state = await this.party.storage.get<RoomState>("state");
        if (state && state.status === 'ACTIVE') {
            state.status = 'COMPLETED';
            state.completedAt = Date.now();
            await this.party.storage.put("state", state);
            
            // Broadcast completion to all users in the room
            this.broadcast({ type: 'COMPLETION', totalHits: state.totalHits });
        }
    }
  }
}