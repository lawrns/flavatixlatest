/**
 * useItemNavigation Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useItemNavigation } from '@/hooks/useItemNavigation';

describe('useItemNavigation', () => {
  const mockItems = [
    { id: '1', tasting_id: 'session-1', item_name: 'Item 1', overall_score: 85, photo_url: undefined, created_at: '', updated_at: '' },
    { id: '2', tasting_id: 'session-1', item_name: 'Item 2', overall_score: undefined, photo_url: 'url', created_at: '', updated_at: '' },
    { id: '3', tasting_id: 'session-1', item_name: 'Item 3', overall_score: 90, photo_url: undefined, created_at: '', updated_at: '' },
  ];

  const mockSetCurrentItemIndex = jest.fn();
  const mockSetPhase = jest.fn();
  const mockAddNewItem = jest.fn();
  const mockCompleteSession = jest.fn();
  const mockSetShowEditTastingDashboard = jest.fn();
  const mockSetShowItemSuggestions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to next item', () => {
    const { result } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 0,
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
        setShowEditTastingDashboard: mockSetShowEditTastingDashboard,
        setShowItemSuggestions: mockSetShowItemSuggestions,
      })
    );

    act(() => {
      result.current.handleNextItem();
    });

    expect(mockSetCurrentItemIndex).toHaveBeenCalledWith(1);
  });

  it('should complete session when on last item and clicking next', () => {
    const { result } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 2, // Last item
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
        setShowEditTastingDashboard: mockSetShowEditTastingDashboard,
        setShowItemSuggestions: mockSetShowItemSuggestions,
      })
    );

    act(() => {
      result.current.handleNextItem();
    });

    expect(mockCompleteSession).toHaveBeenCalled();
    expect(mockSetCurrentItemIndex).not.toHaveBeenCalled();
  });

  it('should navigate to previous item', () => {
    const { result } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 2,
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
        setShowEditTastingDashboard: mockSetShowEditTastingDashboard,
        setShowItemSuggestions: mockSetShowItemSuggestions,
      })
    );

    act(() => {
      result.current.handlePreviousItem();
    });

    expect(mockSetCurrentItemIndex).toHaveBeenCalledWith(1);
  });

  it('should not navigate before first item', () => {
    const { result } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 0,
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
        setShowEditTastingDashboard: mockSetShowEditTastingDashboard,
        setShowItemSuggestions: mockSetShowItemSuggestions,
      })
    );

    act(() => {
      result.current.handlePreviousItem();
    });

    expect(mockSetCurrentItemIndex).not.toHaveBeenCalled();
  });

  it('should navigate to specific item', () => {
    const { result } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 0,
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
        setShowEditTastingDashboard: mockSetShowEditTastingDashboard,
        setShowItemSuggestions: mockSetShowItemSuggestions,
      })
    );

    act(() => {
      result.current.handleItemNavigation(2);
    });

    expect(mockSetCurrentItemIndex).toHaveBeenCalledWith(2);
    expect(mockSetShowEditTastingDashboard).toHaveBeenCalledWith(false);
    expect(mockSetShowItemSuggestions).toHaveBeenCalledWith(false);
  });

  it('should not navigate to invalid index', () => {
    const { result } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 0,
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
        setShowEditTastingDashboard: mockSetShowEditTastingDashboard,
        setShowItemSuggestions: mockSetShowItemSuggestions,
      })
    );

    act(() => {
      result.current.handleItemNavigation(-1);
    });

    expect(mockSetCurrentItemIndex).not.toHaveBeenCalled();

    act(() => {
      result.current.handleItemNavigation(10);
    });

    expect(mockSetCurrentItemIndex).not.toHaveBeenCalled();
  });

  it('should return correct navigation items', () => {
    const { result } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 1,
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
        setShowEditTastingDashboard: mockSetShowEditTastingDashboard,
        setShowItemSuggestions: mockSetShowItemSuggestions,
      })
    );

    const navItems = result.current.getNavigationItems();

    expect(navItems).toHaveLength(3);
    expect(navItems[0]).toEqual({
      id: '1',
      index: 0,
      name: 'Item 1',
      isCompleted: true,
      hasPhoto: false,
      score: 85,
      isCurrent: false,
    });
    expect(navItems[1].isCurrent).toBe(true);
    expect(navItems[1].hasPhoto).toBe(true);
    expect(navItems[1].isCompleted).toBe(false);
  });

  it('should report correct canGoNext and canGoPrevious', () => {
    // At first item
    const { result: result1 } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 0,
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
      })
    );

    expect(result1.current.canGoNext).toBe(true);
    expect(result1.current.canGoPrevious).toBe(false);

    // At last item
    const { result: result2 } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 2,
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
      })
    );

    expect(result2.current.canGoNext).toBe(false);
    expect(result2.current.canGoPrevious).toBe(true);

    // In middle
    const { result: result3 } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 1,
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
      })
    );

    expect(result3.current.canGoNext).toBe(true);
    expect(result3.current.canGoPrevious).toBe(true);
  });

  it('should handle back to setup', () => {
    const { result } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 0,
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
      })
    );

    act(() => {
      result.current.handleBackToSetup();
    });

    expect(mockSetPhase).toHaveBeenCalledWith('setup');
  });

  it('should handle add next item', async () => {
    const { result } = renderHook(() =>
      useItemNavigation({
        items: mockItems,
        currentItemIndex: 0,
        setCurrentItemIndex: mockSetCurrentItemIndex,
        setPhase: mockSetPhase,
        addNewItem: mockAddNewItem,
        completeSession: mockCompleteSession,
      })
    );

    await act(async () => {
      await result.current.handleAddNextItem();
    });

    expect(mockAddNewItem).toHaveBeenCalled();
    expect(mockSetPhase).toHaveBeenCalledWith('tasting');
  });
});
