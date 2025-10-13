import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient, supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { Trophy, Clock, Target, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface CompetitionItem {
  id: string;
  item_name: string;
  notes: string | null;
  aroma: string | null;
  flavor: string | null;
  overall_score: number | null;
  correct_answers: any | null;
  include_in_ranking: boolean;
  photo_url: string | null;
}

interface CompetitionSession {
  id: string;
  user_id: string;
  category: string;
  session_name: string;
  mode: string;
  rank_participants: boolean;
  ranking_type: string | null;
  is_blind_items: boolean;
  is_blind_attributes: boolean;
  total_items: number;
  completed_items: number;
}

interface ParticipantAnswer {
  item_id: string;
  aroma: string;
  flavor: string;
  overall_score: number;
  notes: string;
  time_spent: number; // seconds
}

interface CompetitionSessionProps {
  sessionId: string;
}

export const CompetitionSession: React.FC<CompetitionSessionProps> = ({ sessionId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const [session, setSession] = useState<CompetitionSession | null>(null);
  const [items, setItems] = useState<CompetitionItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, ParticipantAnswer>>(new Map());
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [itemStartTime, setItemStartTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Form state for current item
  const [currentAnswer, setCurrentAnswer] = useState({
    aroma: '',
    flavor: '',
    overall_score: 50,
    notes: ''
  });

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    // Reset item start time when changing items
    setItemStartTime(Date.now());
  }, [currentItemIndex]);

  const loadSession = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('quick_tastings')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      const { data: itemsData, error: itemsError } = await supabase
        .from('quick_tasting_items')
        .select('*')
        .eq('tasting_id', sessionId)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

    } catch (error) {
      console.error('Error loading competition:', error);
      toast.error('Failed to load competition');
    }
  };

  const saveCurrentAnswer = () => {
    if (!items[currentItemIndex]) return;

    const timeSpent = Math.floor((Date.now() - itemStartTime) / 1000);
    const answer: ParticipantAnswer = {
      item_id: items[currentItemIndex].id,
      aroma: currentAnswer.aroma,
      flavor: currentAnswer.flavor,
      overall_score: currentAnswer.overall_score,
      notes: currentAnswer.notes,
      time_spent: timeSpent
    };

    setAnswers(prev => new Map(prev).set(items[currentItemIndex].id, answer));
  };

  const handleNext = () => {
    saveCurrentAnswer();
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
      // Load saved answer if exists
      const savedAnswer = answers.get(items[currentItemIndex + 1]?.id);
      if (savedAnswer) {
        setCurrentAnswer({
          aroma: savedAnswer.aroma,
          flavor: savedAnswer.flavor,
          overall_score: savedAnswer.overall_score,
          notes: savedAnswer.notes
        });
      } else {
        setCurrentAnswer({ aroma: '', flavor: '', overall_score: 50, notes: '' });
      }
    }
  };

  const handlePrevious = () => {
    saveCurrentAnswer();
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
      // Load saved answer
      const savedAnswer = answers.get(items[currentItemIndex - 1]?.id);
      if (savedAnswer) {
        setCurrentAnswer({
          aroma: savedAnswer.aroma,
          flavor: savedAnswer.flavor,
          overall_score: savedAnswer.overall_score,
          notes: savedAnswer.notes
        });
      }
    }
  };

  const calculateScore = (): number => {
    let totalScore = 0;
    let maxScore = 0;

    answers.forEach((answer, itemId) => {
      const item = items.find(i => i.id === itemId);
      if (!item || !item.correct_answers || !item.include_in_ranking) return;

      const correctAnswers = item.correct_answers;
      let itemScore = 0;
      let itemMaxScore = 0;

      // Score overall_score (40 points max)
      if (correctAnswers.overall_score !== undefined) {
        const diff = Math.abs(answer.overall_score - correctAnswers.overall_score);
        itemScore += Math.max(0, 40 - diff);
        itemMaxScore += 40;
      }

      // Score aroma (30 points max)
      if (correctAnswers.aroma) {
        const aromaMatch = calculateTextMatch(answer.aroma, correctAnswers.aroma);
        itemScore += aromaMatch * 30;
        itemMaxScore += 30;
      }

      // Score flavor (30 points max)
      if (correctAnswers.flavor) {
        const flavorMatch = calculateTextMatch(answer.flavor, correctAnswers.flavor);
        itemScore += flavorMatch * 30;
        itemMaxScore += 30;
      }

      totalScore += itemScore;
      maxScore += itemMaxScore;
    });

    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  };

  const calculateTextMatch = (userAnswer: string, correctAnswer: string): number => {
    const userWords = userAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const correctWords = correctAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    if (correctWords.length === 0) return 0;

    let matches = 0;
    correctWords.forEach(word => {
      if (userWords.some(uw => uw.includes(word) || word.includes(uw))) {
        matches++;
      }
    });

    return matches / correctWords.length;
  };

  const handleSubmit = async () => {
    saveCurrentAnswer();

    if (answers.size < items.length) {
      const unanswered = items.length - answers.size;
      if (!confirm(`You have ${unanswered} unanswered item(s). Submit anyway?`)) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const calculatedScore = calculateScore();
      const totalTime = Math.floor((Date.now() - startTime) / 1000);

      // Save participant record with score
      const { error: participantError } = await supabase
        .from('tasting_participants')
        .upsert({
          tasting_id: sessionId,
          user_id: user!.id,
          role: 'participant',
          score: calculatedScore
        } as any);

      if (participantError) throw participantError;

      // Save all answers to items and extract descriptors
      for (const [itemId, answer] of Array.from(answers.entries())) {
        const item = items.find(i => i.id === itemId);

        // Update item with answer
        await (supabase as any)
          .from('quick_tasting_items')
          .update({
            aroma: answer.aroma,
            flavor: answer.flavor,
            overall_score: answer.overall_score,
            notes: answer.notes
          })
          .eq('id', itemId);

        // Extract flavor descriptors
        if (item && (answer.aroma || answer.flavor || answer.notes)) {
          try {
            // Get current session for auth token
            const { data: { session: authSession } } = await supabase.auth.getSession();
            if (!authSession) {
              console.warn('No active session for descriptor extraction');
              return;
            }

            await fetch('/api/flavor-wheels/extract-descriptors', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authSession.access_token}`
              },
              body: JSON.stringify({
                sourceType: 'quick_tasting',
                sourceId: itemId,
                structuredData: {
                  aroma_notes: answer.aroma,
                  flavor_notes: answer.flavor,
                  other_notes: answer.notes
                },
                itemContext: {
                  itemName: item.item_name,
                  itemCategory: session?.category
                }
              })
            });
          } catch (error) {
            console.error('Error extracting descriptors:', error);
            // Don't fail the submission if descriptor extraction fails
          }
        }
      }

      setScore(calculatedScore);
      setShowResults(true);
      toast.success(`Competition submitted! Your score: ${calculatedScore}%`);

    } catch (error) {
      console.error('Error submitting competition:', error);
      toast.error('Failed to submit competition');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session || items.length === 0) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-sm mx-auto"></div>
          <p className="text-text-secondary">Loading competition...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background-light p-md">
        <div className="max-w-2xl mx-auto">
          <div className="card p-xl text-center">
            <Trophy size={64} className="mx-auto mb-md text-primary" />
            <h1 className="text-h1 font-heading font-bold text-text-primary mb-sm">
              Competition Complete!
            </h1>
            <div className="text-6xl font-bold text-primary mb-md">
              {score}%
            </div>
            <p className="text-body text-text-secondary mb-lg">
              You answered {answers.size} out of {items.length} items
            </p>
            <div className="flex gap-md justify-center">
              <button
                onClick={() => router.push(`/competition/${sessionId}/leaderboard`)}
                className="btn-primary"
              >
                View Leaderboard
              </button>
              <button
                onClick={() => router.push('/my-tastings')}
                className="btn-secondary"
              >
                My Tastings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = items[currentItemIndex];

  return (
    <div className="min-h-screen bg-background-light pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border-default p-md">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/my-tastings')}
            className="flex items-center text-text-secondary hover:text-text-primary mb-sm"
          >
            <ChevronLeft size={20} className="mr-xs" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-heading font-bold text-text-primary">
                {session.session_name}
              </h1>
              <p className="text-small text-text-secondary">
                Item {currentItemIndex + 1} of {items.length}
              </p>
            </div>
            <div className="flex items-center gap-md">
              <div className="flex items-center text-text-secondary">
                <Target size={16} className="mr-xs" />
                <span className="text-small">{answers.size}/{items.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-md">
        <div className="card p-lg">
          {/* Item Name */}
          <div className="mb-lg">
            <h2 className="text-h3 font-heading font-semibold text-text-primary mb-xs">
              {session.is_blind_items ? `Item ${currentItemIndex + 1}` : currentItem.item_name}
            </h2>
            <p className="text-small text-text-secondary">
              {session.category.charAt(0).toUpperCase() + session.category.slice(1)}
            </p>
          </div>

          {/* Answer Form */}
          <div className="space-y-md">
            {!session.is_blind_attributes && (
              <>
                <div>
                  <label className="block text-small font-body font-medium text-text-primary mb-xs">
                    Aroma Notes
                  </label>
                  <textarea
                    value={currentAnswer.aroma}
                    onChange={(e) => setCurrentAnswer(prev => ({ ...prev, aroma: e.target.value }))}
                    placeholder="Describe the aromas you detect..."
                    className="form-input w-full h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-small font-body font-medium text-text-primary mb-xs">
                    Flavor Notes
                  </label>
                  <textarea
                    value={currentAnswer.flavor}
                    onChange={(e) => setCurrentAnswer(prev => ({ ...prev, flavor: e.target.value }))}
                    placeholder="Describe the flavors you taste..."
                    className="form-input w-full h-24 resize-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-small font-body font-medium text-text-primary mb-xs">
                Overall Score: {currentAnswer.overall_score}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={currentAnswer.overall_score}
                onChange={(e) => setCurrentAnswer(prev => ({ ...prev, overall_score: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-xs">
                <span>Poor (1)</span>
                <span>Excellent (100)</span>
              </div>
            </div>

            <div>
              <label className="block text-small font-body font-medium text-text-primary mb-xs">
                Additional Notes
              </label>
              <textarea
                value={currentAnswer.notes}
                onChange={(e) => setCurrentAnswer(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any other observations..."
                className="form-input w-full h-24 resize-none"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-lg pt-lg border-t border-border-default">
            <button
              onClick={handlePrevious}
              disabled={currentItemIndex === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft size={16} className="mr-xs" />
              Previous
            </button>

            {currentItemIndex < items.length - 1 ? (
              <button
                onClick={handleNext}
                className="btn-primary flex items-center"
              >
                Next
                <ChevronRight size={16} className="ml-xs" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Trophy size={16} className="mr-xs" />
                {isSubmitting ? 'Submitting...' : 'Submit Competition'}
              </button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-md">
          <div className="flex gap-xs">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex-1 h-2 rounded-full ${
                  answers.has(item.id)
                    ? 'bg-success'
                    : index === currentItemIndex
                    ? 'bg-primary'
                    : 'bg-border-default'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

