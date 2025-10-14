/**
 * Realtime Collaboration Manager
 * Handles Supabase Realtime for collaborative tastings
 */

import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { getSupabaseClient } from '../supabase';

export interface Cursor {
  userId: string;
  userName: string;
  itemId?: string;
  field?: string;
  position?: number;
  color: string;
  timestamp: number;
}

export interface PresenceState {
  userId: string;
  userName: string;
  avatar?: string;
  currentItem?: string;
  isTyping?: boolean;
  lastActivity: number;
}

export interface RealtimeUpdate {
  type: 'item_update' | 'score_update' | 'note_update' | 'session_complete';
  itemId?: string;
  field?: string;
  value: any;
  userId: string;
  timestamp: number;
}

export class RealtimeManager {
  private channel: RealtimeChannel | null = null;
  private sessionId: string;
  private userId: string;
  private userName: string;
  private callbacks: Map<string, Function[]> = new Map();
  private presenceState: Map<string, PresenceState> = new Map();
  private cursorColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD'];
  private colorIndex = 0;

  constructor(sessionId: string, userId: string, userName: string) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.userName = userName;
  }

  /**
   * Initialize realtime connection for a tasting session
   */
  async connect() {
    const supabase = getSupabaseClient();

    // Create channel with presence and broadcast
    this.channel = supabase.channel(`tasting:${this.sessionId}`, {
      config: {
        broadcast: {
          self: false, // Don't receive own broadcasts
          ack: true    // Wait for server acknowledgment
        },
        presence: {
          key: this.userId
        }
      }
    });

    // Set up presence tracking
    this.channel
      .on('presence', { event: 'sync' }, () => {
        this.syncPresence();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this.handleUserJoin(key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this.handleUserLeave(key, leftPresences);
      });

    // Set up broadcast listeners for various events
    this.channel
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        this.handleCursorUpdate(payload as Cursor);
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        this.handleTypingIndicator(payload);
      })
      .on('broadcast', { event: 'item_update' }, ({ payload }) => {
        this.handleItemUpdate(payload);
      })
      .on('broadcast', { event: 'score_update' }, ({ payload }) => {
        this.handleScoreUpdate(payload);
      });

    // Set up database change listeners for data sync
    this.channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quick_tasting_items',
          filter: `tasting_id=eq.${this.sessionId}`
        },
        (payload) => {
          this.handleDatabaseUpdate('item', payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quick_tasting_items',
          filter: `tasting_id=eq.${this.sessionId}`
        },
        (payload) => {
          this.handleDatabaseUpdate('item_added', payload);
        }
      );

    // Subscribe and track our presence
    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await this.updatePresence({
          userId: this.userId,
          userName: this.userName,
          lastActivity: Date.now()
        });

        this.emit('connected', { sessionId: this.sessionId });
        console.log('✅ Realtime connected for session:', this.sessionId);
      }
    });
  }

  /**
   * Update user presence
   */
  async updatePresence(state: Partial<PresenceState>) {
    if (!this.channel) return;

    const fullState: PresenceState = {
      userId: this.userId,
      userName: this.userName,
      lastActivity: Date.now(),
      ...state
    };

    await this.channel.track(fullState);
  }

  /**
   * Send cursor position
   */
  sendCursor(itemId: string, field: string, position?: number) {
    if (!this.channel) return;

    const cursor: Cursor = {
      userId: this.userId,
      userName: this.userName,
      itemId,
      field,
      position,
      color: this.getUserColor(this.userId),
      timestamp: Date.now()
    };

    this.channel.send({
      type: 'broadcast',
      event: 'cursor',
      payload: cursor
    });
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(itemId: string, field: string, isTyping: boolean) {
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: this.userId,
        userName: this.userName,
        itemId,
        field,
        isTyping,
        timestamp: Date.now()
      }
    });

    // Update our presence
    this.updatePresence({ isTyping, currentItem: itemId });
  }

  /**
   * Broadcast item update (optimistic update)
   */
  broadcastItemUpdate(itemId: string, field: string, value: any) {
    if (!this.channel) return;

    const update: RealtimeUpdate = {
      type: 'item_update',
      itemId,
      field,
      value,
      userId: this.userId,
      timestamp: Date.now()
    };

    this.channel.send({
      type: 'broadcast',
      event: 'item_update',
      payload: update
    });
  }

  /**
   * Broadcast score update
   */
  broadcastScoreUpdate(itemId: string, scoreType: string, value: number) {
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'score_update',
      payload: {
        itemId,
        scoreType,
        value,
        userId: this.userId,
        userName: this.userName,
        timestamp: Date.now()
      }
    });
  }

  // Event Handlers
  private syncPresence() {
    const state = this.channel?.presenceState();
    if (!state) return;

    this.presenceState.clear();
    Object.entries(state).forEach(([key, presence]) => {
      if (Array.isArray(presence) && presence.length > 0) {
        const userPresence = presence[0] as any as PresenceState;
        this.presenceState.set(key, userPresence);
      }
    });

    this.emit('presence_sync', Array.from(this.presenceState.values()));
  }

  private handleUserJoin(key: string, newPresences: any) {
    if (newPresences && newPresences.length > 0) {
      const presence = newPresences[0] as PresenceState;
      this.presenceState.set(key, presence);
      this.emit('user_joined', presence);
      console.log('👤 User joined:', presence.userName);
    }
  }

  private handleUserLeave(key: string, leftPresences: any) {
    const presence = this.presenceState.get(key);
    if (presence) {
      this.presenceState.delete(key);
      this.emit('user_left', presence);
      console.log('👤 User left:', presence.userName);
    }
  }

  private handleCursorUpdate(cursor: Cursor) {
    if (cursor.userId === this.userId) return; // Ignore own cursor
    this.emit('cursor_update', cursor);
  }

  private handleTypingIndicator(payload: any) {
    if (payload.userId === this.userId) return;
    this.emit('typing_indicator', payload);
  }

  private handleItemUpdate(update: RealtimeUpdate) {
    if (update.userId === this.userId) return; // Ignore own updates
    this.emit('remote_item_update', update);
  }

  private handleScoreUpdate(payload: any) {
    if (payload.userId === this.userId) return;
    this.emit('remote_score_update', payload);
  }

  private handleDatabaseUpdate(type: string, payload: any) {
    // Handle database changes (source of truth)
    this.emit('database_update', {
      type,
      data: payload.new || payload.old,
      eventType: payload.eventType,
      timestamp: Date.now()
    });
  }

  /**
   * Get or assign a color for a user
   */
  private getUserColor(userId: string): string {
    // Use a deterministic color based on userId
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this.cursorColors[hash % this.cursorColors.length];
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)?.push(callback);
  }

  /**
   * Emit events to subscribers
   */
  private emit(event: string, data: any) {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  /**
   * Get active users
   */
  getActiveUsers(): PresenceState[] {
    return Array.from(this.presenceState.values());
  }

  /**
   * Disconnect from realtime
   */
  async disconnect() {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
      this.presenceState.clear();
      this.callbacks.clear();
      console.log('🔌 Realtime disconnected');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.channel !== null;
  }
}

// Singleton instance manager
let currentManager: RealtimeManager | null = null;

export function getRealtimeManager(sessionId?: string, userId?: string, userName?: string): RealtimeManager | null {
  if (!sessionId || !userId || !userName) {
    return currentManager;
  }

  // Create new manager if needed
  if (!currentManager || currentManager['sessionId'] !== sessionId) {
    if (currentManager) {
      currentManager.disconnect();
    }
    currentManager = new RealtimeManager(sessionId, userId, userName);
  }

  return currentManager;
}

export function clearRealtimeManager() {
  if (currentManager) {
    currentManager.disconnect();
    currentManager = null;
  }
}