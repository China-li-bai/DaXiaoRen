export const PARTYKIT_CONFIG = {
  host: 'villain-smash-party.china-li-bai.partykit.dev',
  rooms: {
    game: (id: string) => `game-${id}`,
    leaderboard: 'global-leaderboard',
  },
} as const;

export const getPartyKitHost = () => {
  return PARTYKIT_CONFIG.host;
};

export const getRoomId = (type: 'game' | 'leaderboard', id?: string) => {
  switch (type) {
    case 'game':
      return id ? PARTYKIT_CONFIG.rooms.game(id) : 'default-game';
    case 'leaderboard':
      return PARTYKIT_CONFIG.rooms.leaderboard;
    default:
      throw new Error(`Unknown room type: ${type}`);
  }
};
