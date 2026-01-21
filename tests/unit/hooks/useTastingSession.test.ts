/**
 * useTastingSession Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useTastingSession } from '@/hooks/useTastingSession';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: 'new-item-id', item_name: 'Coffee 1' }, 
            error: null 
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
    })),
    auth: {
      getSession: jest.fn(() => Promise.resolve({ 
        data: { session: { access_token: 'mock-token' } }, 
        error: null 
      })),
      refreshSession: jest.fn(),
    },
  })),
}));

jest.mock('@/lib/roleService', () => ({
  roleService: {
    getUserPermissions: jest.fn(() => Promise.resolve({
      role: 'host',
      canModerate: true,
      canAddItems: true,
      canManageSession: true,
      canViewAllSuggestions: true,
      canParticipateInTasting: true,
    })),
    addParticipant: jest.fn(),
  },
}));

jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/logger', () => ({
  generateRequestId: jest.fn(() => 'req_test'),
  setRequestId: jest.fn(),
  clearRequestId: jest.fn(),
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useTastingSession', () => {
  const mockSession = {
    id: 'test-session-id',
    user_id: 'test-user-id',
    category: 'coffee',
    custom_category_name: null,
    session_name: 'Test Session',
    notes: '',
    total_items: 0,
    completed_items: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    mode: 'quick',
    study_approach: null,
    rank_participants: false,
    ranking_type: null,
    is_blind_participants: false,
    is_blind_items: false,
    is_blind_attributes: false,
  };

  const mockOnSessionUpdate = jest.fn();
  const mockOnSessionComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty items', async () => {
    const { result } = renderHook(() =>
      useTastingSession({
        session: mockSession,
        userId: 'test-user-id',
        onSessionUpdate: mockOnSessionUpdate,
        onSessionComplete: mockOnSessionComplete,
      })
    );

    expect(result.current.items).toEqual([]);
    expect(result.current.hasItems).toBe(false);
    expect(result.current.completedItems).toBe(0);
  });

  it('should set phase to tasting for quick mode', () => {
    const { result } = renderHook(() =>
      useTastingSession({
        session: { ...mockSession, mode: 'quick' },
        userId: 'test-user-id',
        onSessionUpdate: mockOnSessionUpdate,
        onSessionComplete: mockOnSessionComplete,
      })
    );

    expect(result.current.phase).toBe('tasting');
  });

  it('should set phase to setup for study mode', () => {
    const { result } = renderHook(() =>
      useTastingSession({
        session: { ...mockSession, mode: 'study' },
        userId: 'test-user-id',
        onSessionUpdate: mockOnSessionUpdate,
        onSessionComplete: mockOnSessionComplete,
      })
    );

    expect(result.current.phase).toBe('setup');
  });

  it('should return correct display category name', () => {
    const { result } = renderHook(() =>
      useTastingSession({
        session: mockSession,
        userId: 'test-user-id',
        onSessionUpdate: mockOnSessionUpdate,
        onSessionComplete: mockOnSessionComplete,
      })
    );

    expect(result.current.getDisplayCategoryName('coffee', null)).toBe('Coffee');
    expect(result.current.getDisplayCategoryName('other', 'Custom Category')).toBe('Custom Category');
  });

  it('should allow phase changes', () => {
    const { result } = renderHook(() =>
      useTastingSession({
        session: mockSession,
        userId: 'test-user-id',
        onSessionUpdate: mockOnSessionUpdate,
        onSessionComplete: mockOnSessionComplete,
      })
    );

    act(() => {
      result.current.setPhase('setup');
    });

    expect(result.current.phase).toBe('setup');

    act(() => {
      result.current.setPhase('tasting');
    });

    expect(result.current.phase).toBe('tasting');
  });

  it('should allow current item index changes', () => {
    const { result } = renderHook(() =>
      useTastingSession({
        session: mockSession,
        userId: 'test-user-id',
        onSessionUpdate: mockOnSessionUpdate,
        onSessionComplete: mockOnSessionComplete,
      })
    );

    act(() => {
      result.current.setCurrentItemIndex(2);
    });

    expect(result.current.currentItemIndex).toBe(2);
  });

  it('should return null session when no session provided', () => {
    const { result } = renderHook(() =>
      useTastingSession({
        session: null,
        userId: 'test-user-id',
        onSessionUpdate: mockOnSessionUpdate,
        onSessionComplete: mockOnSessionComplete,
      })
    );

    expect(result.current.items).toEqual([]);
    expect(result.current.currentItem).toBeUndefined();
  });
});
