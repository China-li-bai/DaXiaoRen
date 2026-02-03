import { supabase, isSupabaseConfigured } from './supabaseClient';
import { VillainData, RitualSession, RealtimeHitPayload } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

// Create a new Ritual Session in the Database
export const createRitualSession = async (villain: VillainData): Promise<RitualSession | null> => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, cannot create multiplayer session.");
    return null;
  }

  try {
    const { data, error } = await supabase!
      .from('rituals')
      .insert({
        villain_name: villain.name,
        villain_type: villain.type,
        reason: villain.reason,
        status: 'ACTIVE',
        total_hits: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data as RitualSession;
  } catch (err) {
    console.error("Error creating ritual:", err);
    return null;
  }
};

// Fetch an existing session by ID
export const getRitualSession = async (id: string): Promise<RitualSession | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase!
      .from('rituals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null; // Likely not found
    return data as RitualSession;
  } catch (err) {
    return null;
  }
};

// Update session status to COMPLETED
export const completeRitualSession = async (id: string) => {
  if (!isSupabaseConfigured()) return;
  await supabase!.from('rituals').update({ status: 'COMPLETED' }).eq('id', id);
};

// --- REALTIME HELPERS ---

export const subscribeToRitual = (
  ritualId: string, 
  onHitReceived: (payload: RealtimeHitPayload) => void,
  onFriendJoined: () => void
): RealtimeChannel | null => {
  if (!isSupabaseConfigured()) return null;

  const channel = supabase!.channel(`ritual:${ritualId}`, {
    config: {
      broadcast: { self: false }, // Don't receive own messages
      presence: { key: 'id' },
    }
  });

  channel
    .on('broadcast', { event: 'HIT' }, (payload) => {
       onHitReceived(payload.payload as RealtimeHitPayload);
    })
    .on('presence', { event: 'sync' }, () => {
       const state = channel.presenceState();
       if (Object.keys(state).length > 1) {
         onFriendJoined();
       }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.track({ online_at: new Date().toISOString() });
      }
    });

  return channel;
};

export const broadcastHit = (channel: RealtimeChannel | null, isHost: boolean) => {
  if (!channel) return;
  channel.send({
    type: 'broadcast',
    event: 'HIT',
    payload: { type: 'HIT', damage: 1, sender: isHost ? 'HOST' : 'GUEST' }
  });
};