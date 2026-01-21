/**
 * React Hook for Realtime Collaboration
 * Provides realtime synchronization for collaborative tastings
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeManager, PresenceState, Cursor, RealtimeUpdate } from '@/lib/realtime/realtimeManager';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';

interface UseRealtimeCollaborationProps {
  sessionId: string;
  onRemoteUpdate?: (update: RealtimeUpdate) => void;
  onUserJoined?: (user: PresenceState) => void;
  onUserLeft?: (user: PresenceState) => void;
}

interface CollaborationState {
  isConnected: boolean;
  activeUsers: PresenceState[];
  cursors: Map<string, Cursor>;
  typingIndicators: Map<string, { field: string; itemId: string }>;
}

export function useRealtimeCollaboration({
  sessionId,
  onRemoteUpdate,
  onUserJoined,
  onUserLeft
}: UseRealtimeCollaborationProps) {
  const { user } = useAuth();
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    activeUsers: [],
    cursors: new Map(),
    typingIndicators: new Map()
  });

  const managerRef = useRef<RealtimeManager | null>(null);
  const updateTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Store callback refs to avoid re-running effect when callbacks change
  const onRemoteUpdateRef = useRef(onRemoteUpdate);
  const onUserJoinedRef = useRef(onUserJoined);
  const onUserLeftRef = useRef(onUserLeft);

  // Update refs when callbacks change
  useEffect(() => {
    onRemoteUpdateRef.current = onRemoteUpdate;
    onUserJoinedRef.current = onUserJoined;
    onUserLeftRef.current = onUserLeft;
  }, [onRemoteUpdate, onUserJoined, onUserLeft]);

  // Initialize realtime connection
  useEffect(() => {
    if (!user || !sessionId) {return;}

    const initRealtime = async () => {
      try {
        // Get user profile for display name
        const supabase = getSupabaseClient();
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('user_id', user.id)
          .single() as { data: { username?: string; full_name?: string } | null };

        const displayName = profile?.full_name || profile?.username || user.email?.split('@')[0] || 'Anonymous';

        // Create and connect realtime manager
        const manager = new RealtimeManager(sessionId, user.id, displayName);
        managerRef.current = manager;

        // Set up event listeners
        manager.on('connected', () => {
          setState(prev => ({ ...prev, isConnected: true }));
          console.log('🚀 Realtime collaboration active');
        });

        manager.on('presence_sync', (users: PresenceState[]) => {
          setState(prev => ({ ...prev, activeUsers: users }));
        });

        manager.on('user_joined', (user: PresenceState) => {
          setState(prev => ({
            ...prev,
            activeUsers: [...prev.activeUsers.filter(u => u.userId !== user.userId), user]
          }));
          onUserJoinedRef.current?.(user);
          toast.success(`${user.userName} joined the tasting`, { duration: 2000 });
        });

        manager.on('user_left', (user: PresenceState) => {
          setState(prev => ({
            ...prev,
            activeUsers: prev.activeUsers.filter(u => u.userId !== user.userId),
            cursors: new Map(Array.from(prev.cursors).filter(([id]) => id !== user.userId)),
            typingIndicators: new Map(Array.from(prev.typingIndicators).filter(([id]) => id !== user.userId))
          }));
          onUserLeftRef.current?.(user);
        });

        manager.on('cursor_update', (cursor: Cursor) => {
          setState(prev => ({
            ...prev,
            cursors: new Map(prev.cursors).set(cursor.userId, cursor)
          }));
        });

        manager.on('typing_indicator', ({ userId, userName, itemId, field, isTyping }: any) => {
          setState(prev => {
            const newIndicators = new Map(prev.typingIndicators);
            if (isTyping) {
              newIndicators.set(userId, { field, itemId });
            } else {
              newIndicators.delete(userId);
            }
            return { ...prev, typingIndicators: newIndicators };
          });
        });

        manager.on('remote_item_update', (update: RealtimeUpdate) => {
          onRemoteUpdateRef.current?.(update);

          // Show subtle notification for remote updates
          const existingTimeout = updateTimeoutRef.current.get(update.itemId || '');
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          // Batch notifications to avoid spam
          const timeout = setTimeout(() => {
            toast.info(`Item updated by collaborator`, { duration: 1000 });
          }, 500);

          updateTimeoutRef.current.set(update.itemId || '', timeout);
        });

        manager.on('database_update', ({ type, data }: any) => {
          // Handle database updates as source of truth
          if (type === 'item_added') {
            toast.info('New item added to tasting', { duration: 2000 });
          }
        });

        // Connect to realtime
        await manager.connect();

      } catch (error) {
        console.error('Failed to initialize realtime:', error);
        toast.error('Could not enable live collaboration');
      }
    };

    initRealtime();

    // Cleanup on unmount
    return () => {
      if (managerRef.current) {
        managerRef.current.disconnect();
        managerRef.current = null;
      }

      // Clear any pending timeouts
      updateTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      updateTimeoutRef.current.clear();
    };
  }, [user, sessionId]); // Only depend on user and sessionId, not callbacks

  // Send cursor position
  const sendCursor = useCallback((itemId: string, field: string, position?: number) => {
    managerRef.current?.sendCursor(itemId, field, position);
  }, []);

  // Send typing indicator
  const sendTypingIndicator = useCallback((itemId: string, field: string, isTyping: boolean) => {
    managerRef.current?.sendTypingIndicator(itemId, field, isTyping);
  }, []);

  // Broadcast item update
  const broadcastItemUpdate = useCallback((itemId: string, field: string, value: any) => {
    managerRef.current?.broadcastItemUpdate(itemId, field, value);
  }, []);

  // Broadcast score update
  const broadcastScoreUpdate = useCallback((itemId: string, scoreType: string, value: number) => {
    managerRef.current?.broadcastScoreUpdate(itemId, scoreType, value);
  }, []);

  // Update presence (e.g., current item)
  const updatePresence = useCallback((state: Partial<PresenceState>) => {
    managerRef.current?.updatePresence(state);
  }, []);

  // Get cursor for a specific user
  const getCursor = useCallback((userId: string): Cursor | undefined => {
    return state.cursors.get(userId);
  }, [state.cursors]);

  // Check if a user is typing in a specific field
  const isUserTyping = useCallback((userId: string, itemId: string, field: string): boolean => {
    const indicator = state.typingIndicators.get(userId);
    return indicator?.itemId === itemId && indicator?.field === field;
  }, [state.typingIndicators]);

  // Get active users except self
  const getCollaborators = useCallback((): PresenceState[] => {
    return state.activeUsers.filter(u => u.userId !== user?.id);
  }, [state.activeUsers, user]);

  return {
    // State
    isConnected: state.isConnected,
    activeUsers: state.activeUsers,
    collaborators: getCollaborators(),
    cursors: state.cursors,
    typingIndicators: state.typingIndicators,

    // Methods
    sendCursor,
    sendTypingIndicator,
    broadcastItemUpdate,
    broadcastScoreUpdate,
    updatePresence,

    // Helpers
    getCursor,
    isUserTyping
  };
}

/**
 * Component to display active collaborators
 */
export function CollaboratorPresence({ users }: { users: PresenceState[] }) {
  if (users.length === 0) {return null;}

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg">
      <span className="text-sm text-foreground/60">Active:</span>
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium border-2 border-background"
            title={user.userName}
          >
            {user.userName.charAt(0).toUpperCase()}
          </div>
        ))}
        {users.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-foreground/20 text-foreground/60 flex items-center justify-center text-xs font-medium border-2 border-background">
            +{users.length - 5}
          </div>
        )}
      </div>
      <span className="text-sm text-foreground/60">
        {users.length} {users.length === 1 ? 'person' : 'people'} tasting
      </span>
    </div>
  );
}

/**
 * Component to display remote cursors
 */
export function RemoteCursor({ cursor }: { cursor: Cursor }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide cursor after 5 seconds of inactivity
    const timeout = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timeout);
  }, [cursor.timestamp]);

  if (!visible) {return null;}

  return (
    <div
      className="absolute z-50 pointer-events-none transition-all duration-200"
      style={{
        transform: `translateX(${cursor.position || 0}px)`
      }}
    >
      <div
        className="w-0.5 h-5 absolute"
        style={{ backgroundColor: cursor.color }}
      />
      <div
        className="px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap absolute -top-6 left-2"
        style={{ backgroundColor: cursor.color }}
      >
        {cursor.userName}
      </div>
    </div>
  );
}

/**
 * Component to show typing indicators
 */
export function TypingIndicator({ users, itemId, field }: {
  users: { userId: string; userName: string }[];
  itemId: string;
  field: string;
}) {
  const typingUsers = users.filter(u => u.userId && u.userName);

  if (typingUsers.length === 0) {return null;}

  const names = typingUsers.map(u => u.userName).join(', ');
  const verb = typingUsers.length === 1 ? 'is' : 'are';

  return (
    <div className="flex items-center gap-1 text-xs text-foreground/50 mt-1">
      <div className="flex space-x-1">
        <span className="w-1 h-1 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1 h-1 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1 h-1 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{names} {verb} typing...</span>
    </div>
  );
}