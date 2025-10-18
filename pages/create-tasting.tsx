import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { ChevronLeft, Users, Trophy, BookOpen, Eye, EyeOff, Plus, Trash2, FileText } from 'lucide-react';
import { StudyModeSelector, StudyApproach } from '@/components/quick-tasting/StudyModeSelector';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { TastingTemplate } from '@/lib/templates/tastingTemplates';

type TastingMode = 'study' | 'competition' | 'quick';

interface TastingItem {
  id: string;
  item_name: string;
  category: string;
  correct_answers?: Record<string, any>;
  include_in_ranking: boolean;
}

interface CreateTastingForm {
  mode: TastingMode;
  study_approach: StudyApproach | null;
  category: string;
  session_name: string;
  rank_participants: boolean;
  ranking_type: string;
  is_blind_participants: boolean;
  is_blind_items: boolean;
  is_blind_attributes: boolean;
  items: TastingItem[];
  notes: string;
  use_template: boolean;
  template_id: string | null;
}

const CATEGORIES = ['coffee', 'tea', 'wine', 'spirits', 'beer', 'chocolate'];
const RANKING_TYPES = ['overall_score', 'average_score', 'weighted_score'];

const CreateTastingPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = getSupabaseClient();

  const [form, setForm] = useState<CreateTastingForm>({
    mode: 'study',
    study_approach: null,
    category: '',
    session_name: '',
    rank_participants: false,
    ranking_type: 'overall_score',
    is_blind_participants: false,
    is_blind_items: false,
    is_blind_attributes: false,
    items: [],
    notes: '',
    use_template: false,
    template_id: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleModeChange = (mode: TastingMode) => {
    setForm(prev => ({
      ...prev,
      mode,
      // Reset study approach when switching away from study mode
      study_approach: mode === 'study' ? prev.study_approach : null,
      // Reset ranking when switching away from competition
      rank_participants: mode === 'competition' ? prev.rank_participants : false,
      // Clear items for study mode
      items: mode === 'study' ? [] : prev.items
    }));
  };

  const addItem = () => {
    const newItem: TastingItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      item_name: `Item ${form.items.length + 1}`,
      category: form.category || 'coffee',
      include_in_ranking: true
    };
    setForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (id: string, updates: Partial<TastingItem>) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const removeItem = (id: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    if (!form.category) {
      toast.error('Please select a category');
      return;
    }

    if (form.mode === 'competition' && form.items.length === 0) {
      toast.error('Competition mode requires at least one preloaded item');
      return;
    }

    if (form.mode === 'study' && form.study_approach === 'predefined' && form.items.length === 0) {
      toast.error('Pre-defined study mode requires at least one preloaded item');
      return;
    }

    if (form.mode === 'study' && !form.study_approach) {
      toast.error('Please select a study approach (Pre-defined or Collaborative)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tastings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          mode: form.mode,
          study_approach: form.study_approach,
          category: form.category,
          session_name: form.session_name || `${form.category.charAt(0).toUpperCase() + form.category.slice(1)} ${form.mode === 'study' ? 'Study' : form.mode === 'competition' ? 'Competition' : 'Tasting'}`,
          notes: form.notes || null,
          rank_participants: form.rank_participants,
          ranking_type: form.ranking_type,
          is_blind_participants: form.is_blind_participants,
          is_blind_items: form.is_blind_items,
          is_blind_attributes: form.is_blind_attributes,
          items: (form.mode === 'competition' || (form.mode === 'study' && form.study_approach === 'predefined')) ? form.items.map(item => ({
            item_name: item.item_name,
            correct_answers: item.correct_answers,
            include_in_ranking: item.include_in_ranking
          })) : []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tasting session');
      }

      const data = await response.json();
      toast.success('Tasting session created successfully!');

      // Navigate to the tasting session
      router.push(`/tasting/${data.tasting.id}`);

    } catch (error) {
      console.error('Error creating tasting:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create tasting session');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-app p-sm">
        <main className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen">
      <main id="main-content" className="pb-20">
        <div className="container mx-auto px-md py-lg max-w-4xl">
          {/* Header */}
          <div className="mb-lg">
            <button
              onClick={() => router.back()}
              className="flex items-center text-text-secondary hover:text-text-primary mb-sm transition-colors font-body"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back
            </button>
            <h1 className="text-h1 font-heading font-bold text-text-primary mb-xs">
              Create Tasting Session
            </h1>
            <p className="text-body font-body text-text-secondary">
              Set up a new tasting session with your preferred mode and settings
            </p>
          </div>

          {/* Mode Selection */}
          <div className="card p-md">
            <h2 className="text-h3 font-heading font-semibold text-text-primary mb-md">Choose Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <button
                type="button"
                onClick={() => router.push('/taste/create/study')}
                className="p-md rounded-lg border-2 border-border-default hover:border-primary-400 transition-all"
              >
                <BookOpen size={32} className="mx-auto mb-sm text-text-secondary" />
                <h3 className="font-heading font-semibold mb-xs">Study Mode</h3>
                <p className="text-small text-text-secondary">
                  Structured tasting sessions with custom categories and templates.
                </p>
              </button>

              <button
                type="button"
                onClick={() => router.push('/taste/create/competition')}
                className="p-md rounded-lg border-2 border-border-default hover:border-primary-400 transition-all"
              >
                <Trophy size={32} className="mx-auto mb-sm text-text-secondary" />
                <h3 className="font-heading font-semibold mb-xs">Competition Mode</h3>
                <p className="text-small text-text-secondary">
                  Preload items with correct answers. Enable participant ranking.
                </p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 dark:border-zinc-700 bg-background-light dark:bg-background-dark">
        <nav className="flex justify-around p-2">
          <Link className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/dashboard">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link className="flex flex-col items-center gap-1 p-2 text-primary" href="/taste">
            <span className="material-symbols-outlined">restaurant</span>
            <span className="text-xs font-bold">Taste</span>
          </Link>
          <Link className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/review">
            <span className="material-symbols-outlined">reviews</span>
            <span className="text-xs font-medium">Review</span>
          </Link>
          <Link className="flex flex-col items-center gap-1 p-2 text-zinc-500 dark:text-zinc-300" href="/flavor-wheels">
            <span className="material-symbols-outlined">donut_small</span>
            <span className="text-xs font-medium">Wheels</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default CreateTastingPage;

// Disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {}
  };
}
