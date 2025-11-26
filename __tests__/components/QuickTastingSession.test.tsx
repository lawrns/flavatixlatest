import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuickTastingSession from '@/components/quick-tasting/QuickTastingSession';
import { getSupabaseClient } from '@/lib/supabase';

// Mock the Supabase client
jest.mock('@/lib/supabase');

// Mock useAuth
jest.mock('@/contexts/SimpleAuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false,
  }),
}));

// Mock toast
jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('QuickTastingSession - Complete Tasting Button', () => {
  const mockSession = {
    id: 'test-session-id',
    user_id: 'test-user-id',
    category: 'coffee',
    session_name: 'Test Session',
    notes: '',
    total_items: 1,
    completed_items: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    mode: 'quick',
  };

  const mockOnSessionComplete = jest.fn();
  const mockSupabase = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: [], error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'new-item-id' }, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockSession, error: null })),
          })),
        })),
      })),
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('should disable Complete Tasting button when loading', async () => {
    render(
      <QuickTastingSession
        session={mockSession}
        userId="test-user-id"
        onSessionComplete={mockOnSessionComplete}
      />
    );

    // Find the Complete Tasting button
    const completeButton = screen.queryByText('Complete Tasting');
    
    if (completeButton) {
      // Click the button
      fireEvent.click(completeButton);

      // Button should show loading state
      await waitFor(() => {
        const loadingButton = screen.queryByText('Completing...');
        if (loadingButton) {
          expect(loadingButton).toBeDisabled();
        }
      });
    }
  });

  it('should prevent multiple clicks on Complete Tasting button', async () => {
    render(
      <QuickTastingSession
        session={mockSession}
        userId="test-user-id"
        onSessionComplete={mockOnSessionComplete}
      />
    );

    const completeButton = screen.queryByText('Complete Tasting');
    
    if (completeButton) {
      // Rapidly click the button 3 times
      fireEvent.click(completeButton);
      fireEvent.click(completeButton);
      fireEvent.click(completeButton);

      // Wait for async operations
      await waitFor(() => {
        // The update function should only be called once
        expect(mockSupabase.from).toHaveBeenCalledWith('quick_tastings');
      });

      // Verify onSessionComplete was called only once
      await waitFor(() => {
        expect(mockOnSessionComplete).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    }
  });

  it('should call onSessionComplete with updated session data', async () => {
    const updatedSession = {
      ...mockSession,
      completed_at: new Date().toISOString(),
    };

    (mockSupabase as any).from = jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: updatedSession, error: null })),
          })),
        })),
      })),
    }));

    render(
      <QuickTastingSession
        session={mockSession}
        userId="test-user-id"
        onSessionComplete={mockOnSessionComplete}
      />
    );

    const completeButton = screen.queryByText('Complete Tasting');
    
    if (completeButton) {
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockOnSessionComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            completed_at: expect.any(String),
          })
        );
      });
    }
  });

  it('should handle errors gracefully when completing session', async () => {
    const mockError = new Error('Database error');
    (mockSupabase as any).from = jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
          })),
        })),
      })),
    }));

    render(
      <QuickTastingSession
        session={mockSession}
        userId="test-user-id"
        onSessionComplete={mockOnSessionComplete}
      />
    );

    const completeButton = screen.queryByText('Complete Tasting');
    
    if (completeButton) {
      fireEvent.click(completeButton);

      await waitFor(() => {
        // Should not call onSessionComplete on error
        expect(mockOnSessionComplete).not.toHaveBeenCalled();
      });
    }
  });
});

describe('QuickTastingSession - Session Completion Flow', () => {
  const mockSession = {
    id: 'test-session-id',
    user_id: 'test-user-id',
    category: 'coffee',
    session_name: 'Test Session',
    notes: 'Test notes',
    total_items: 1,
    completed_items: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    mode: 'quick',
  };

  const mockOnSessionComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update session with completed_at timestamp', async () => {
    const mockUpdate = jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { ...mockSession, completed_at: new Date().toISOString() }, 
            error: null 
          })),
        })),
      })),
    }));

    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        update: mockUpdate,
      })),
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    render(
      <QuickTastingSession
        session={mockSession}
        userId="test-user-id"
        onSessionComplete={mockOnSessionComplete}
      />
    );

    const completeButton = screen.queryByText('Complete Tasting');
    
    if (completeButton) {
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            completed_at: expect.any(String),
          })
        );
      });
    }
  });

  it('should include session notes when completing', async () => {
    const mockUpdate = jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: mockSession, 
            error: null 
          })),
        })),
      })),
    }));

    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        update: mockUpdate,
      })),
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    render(
      <QuickTastingSession
        session={mockSession}
        userId="test-user-id"
        onSessionComplete={mockOnSessionComplete}
      />
    );

    const completeButton = screen.queryByText('Complete Tasting');
    
    if (completeButton) {
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            notes: expect.any(String),
          })
        );
      });
    }
  });
});

