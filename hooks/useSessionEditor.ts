/**
 * useSessionEditor Hook
 * 
 * Manages session editing operations like name changes and category updates.
 */

import { useState, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { toast } from '../lib/toast';
import { logger } from '../lib/logger';
import type { QuickTasting } from './useTastingSession';

interface UseSessionEditorOptions {
  session: QuickTasting | null;
  onSessionUpdate?: (session: QuickTasting) => void;
}

interface UseSessionEditorReturn {
  // Session name editing
  isEditingSessionName: boolean;
  editingSessionName: string;
  setEditingSessionName: (name: string) => void;
  startEditingSessionName: () => void;
  saveSessionName: () => Promise<void>;
  cancelEditingSessionName: () => void;
  
  // Category changing
  isChangingCategory: boolean;
  handleCategoryChange: (newCategory: string) => Promise<void>;
}

export function useSessionEditor({
  session,
  onSessionUpdate,
}: UseSessionEditorOptions): UseSessionEditorReturn {
  const [isEditingSessionName, setIsEditingSessionName] = useState(false);
  const [editingSessionName, setEditingSessionName] = useState(session?.session_name || '');
  const [isChangingCategory, setIsChangingCategory] = useState(false);
  
  const supabase = getSupabaseClient() as any;

  const startEditingSessionName = useCallback(() => {
    if (!session) return;
    setIsEditingSessionName(true);
    setEditingSessionName(session.session_name || '');
  }, [session]);

  const saveSessionName = useCallback(async () => {
    if (!session) return;

    if (editingSessionName.trim() && editingSessionName.trim() !== session.session_name) {
      try {
        const { data, error } = await supabase
          .from('quick_tastings')
          .update({ session_name: editingSessionName.trim() })
          .eq('id', session.id)
          .select()
          .single();

        if (error) throw error;

        const updatedSession = { ...session, session_name: editingSessionName.trim() };
        if (onSessionUpdate) {
          onSessionUpdate(updatedSession);
        }
        toast.success('Session name updated!');
      } catch (error) {
        logger.error('SessionEditor', 'Error updating session name', error);
        toast.error('Failed to update session name');
      }
    }
    setIsEditingSessionName(false);
  }, [session, editingSessionName, onSessionUpdate, supabase]);

  const cancelEditingSessionName = useCallback(() => {
    if (!session) return;
    setEditingSessionName(session.session_name || '');
    setIsEditingSessionName(false);
  }, [session]);

  const handleCategoryChange = useCallback(async (newCategory: string) => {
    if (!session || newCategory === session.category) return;

    setIsChangingCategory(true);
    try {
      const { error } = await supabase
        .from('quick_tastings')
        .update({ category: newCategory })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      const updatedSession = { ...session, category: newCategory };
      if (onSessionUpdate) {
        onSessionUpdate(updatedSession);
      }
      toast.success('Category updated!');
    } catch (error) {
      logger.error('SessionEditor', 'Error updating category', error);
      toast.error('Failed to update category');
    } finally {
      setIsChangingCategory(false);
    }
  }, [session, onSessionUpdate, supabase]);

  return {
    isEditingSessionName,
    editingSessionName,
    setEditingSessionName,
    startEditingSessionName,
    saveSessionName,
    cancelEditingSessionName,
    isChangingCategory,
    handleCategoryChange,
  };
}
