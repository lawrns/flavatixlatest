import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { toast } from '@/lib/toast';
import { Trophy, BookOpen } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ModeCard from '@/components/ui/ModeCard';
import { StudyApproach } from '@/components/quick-tasting/StudyModeSelector';

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

const CreateTastingPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [form, _setForm] = useState<CreateTastingForm>({
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

  const [_isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const _handleSubmit = async (e: React.FormEvent) => {
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

  if (loading || !user) {
    return null;
  }

  return (
    <PageLayout
      title="Create Tasting Session"
      subtitle="Set up a new tasting session with your preferred mode and settings"
      showBack
      containerSize="2xl"
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-line bg-white/90 p-5 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.18)]">
          <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">
            Session setup
          </p>
          <h2 className="mt-2 text-h2 font-semibold tracking-tight text-fg">
            Choose the structure before you collect the notes.
          </h2>
          <p className="mt-3 text-body-sm leading-relaxed text-fg-muted">
            Study mode favors guided exploration. Competition mode is built for scored
            sessions and preloaded answers.
          </p>

          <div className="mt-6 rounded-[1.5rem] border border-dashed border-line bg-bg-inset p-4">
            <p className="text-body-sm font-medium text-fg">Use the right mode for the room.</p>
            <p className="mt-2 text-caption leading-relaxed text-fg-muted">
              Study sessions are better for discovery. Competition sessions are better
              when everyone needs the same rubric.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <ModeCard
            icon={BookOpen}
            iconBgColor="bg-blue-500/10 dark:bg-blue-500/20"
            iconColor="text-blue-600 dark:text-blue-500"
            title="Study Mode"
            description="Structured tasting sessions with custom categories and templates."
            href="/taste/create/study"
            delay={0.03}
          />
          <ModeCard
            icon={Trophy}
            iconBgColor="bg-amber-500/10 dark:bg-amber-500/20"
            iconColor="text-amber-600 dark:text-amber-500"
            title="Competition Mode"
            description="Preload items with correct answers. Enable participant ranking."
            href="/taste/create/competition"
            delay={0.09}
          />
        </section>
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
