import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { toast } from '@/lib/toast';
import { Users, Trophy, BookOpen, Eye, EyeOff, Plus, Trash2, FileText } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
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
    template_id: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleModeChange = (mode: TastingMode) => {
    setForm((prev) => ({
      ...prev,
      mode,
      // Reset study approach when switching away from study mode
      study_approach: mode === 'study' ? prev.study_approach : null,
      // Reset ranking when switching away from competition
      rank_participants: mode === 'competition' ? prev.rank_participants : false,
      // Clear items for study mode
      items: mode === 'study' ? [] : prev.items,
    }));
  };

  const addItem = () => {
    const newItem: TastingItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      item_name: `Item ${form.items.length + 1}`,
      category: form.category || 'coffee',
      include_in_ranking: true,
    };
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateItem = (id: string, updates: Partial<TastingItem>) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const removeItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
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
          session_name:
            form.session_name ||
            `${form.category.charAt(0).toUpperCase() + form.category.slice(1)} ${form.mode === 'study' ? 'Study' : form.mode === 'competition' ? 'Competition' : 'Tasting'}`,
          notes: form.notes || null,
          rank_participants: form.rank_participants,
          ranking_type: form.ranking_type,
          is_blind_participants: form.is_blind_participants,
          is_blind_items: form.is_blind_items,
          is_blind_attributes: form.is_blind_attributes,
          items:
            form.mode === 'competition' ||
            (form.mode === 'study' && form.study_approach === 'predefined')
              ? form.items.map((item) => ({
                  item_name: item.item_name,
                  correct_answers: item.correct_answers,
                  include_in_ranking: item.include_in_ranking,
                }))
              : [],
        }),
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

  if (!user) {
    return null;
  }

  return (
    <PageLayout
      title="Create Tasting Session"
      subtitle="Set up a new tasting session with your preferred mode and settings"
      showBack
      containerSize="2xl"
    >
      {/* Mode Selection */}
      <div className="bg-gemini-card dark:bg-zinc-800 rounded-[22px] p-6 mt-2">
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
    </PageLayout>
  );
};

export default CreateTastingPage;

// Disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {},
  };
}
