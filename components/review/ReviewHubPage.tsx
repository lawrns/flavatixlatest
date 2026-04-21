import { useState } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { ClipboardList, Edit3, Clock, Share2, HelpCircle, X } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ModeCard from '@/components/ui/ModeCard';

const primaryOptions = [
  {
    title: 'Structured Review',
    description: 'Score aroma, flavor, mouthfeel, and more.',
    icon: ClipboardList,
    iconBgColor: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
    href: '/review/create',
  },
  {
    title: 'Quick Note',
    description: 'Write how it felt in plain language.',
    icon: Edit3,
    iconBgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-700 dark:text-amber-500',
    href: '/review/prose',
  },
];

const secondaryOptions = [
  {
    title: 'Review History',
    description: 'Browse and search past notes.',
    icon: Clock,
    iconBgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-700 dark:text-blue-500',
    href: '/review/my-reviews',
  },
  {
    title: 'Export & Share',
    description: 'Create PDFs or share tasting links.',
    icon: Share2,
    iconBgColor: 'bg-zinc-900/10 dark:bg-zinc-100/10',
    iconColor: 'text-zinc-800 dark:text-zinc-200',
    href: '/review/my-reviews?action=export',
  },
];

const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[2rem] border border-white/10 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Close help"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Review modes
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
          Pick the level of structure you need.
        </h2>

        <div className="mt-6 space-y-4">
          {[
            {
              icon: ClipboardList,
              bg: 'bg-primary/10',
              fg: 'text-primary',
              title: 'Structured Review',
              body: 'Capture scored characteristics across a fixed rubric for consistent comparisons.',
            },
            {
              icon: Edit3,
              bg: 'bg-amber-500/10',
              fg: 'text-amber-700',
              title: 'Quick Note',
              body: 'Write freely when the details matter more than a scoring grid.',
            },
            {
              icon: Clock,
              bg: 'bg-blue-500/10',
              fg: 'text-blue-700',
              title: 'Review History',
              body: 'Return to completed and in-progress work from one archive surface.',
            },
          ].map(({ icon: Icon, bg, fg, title, body }) => (
            <div key={title} className="flex gap-3 rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
                <Icon className={`h-4 w-4 ${fg}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-950">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.99]"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default function ReviewHubPage() {
  const { user, loading } = useAuth();
  const [showHelp, setShowHelp] = useState(false);

  if (loading || !user) {
    return null;
  }

  const helpButton = (
    <button
      onClick={() => setShowHelp(true)}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-fg-muted transition-colors hover:border-fg-muted/40 hover:text-fg"
      aria-label="Help"
    >
      <HelpCircle className="h-5 w-5" />
    </button>
  );

  return (
    <PageLayout
      title="Reviews"
      subtitle="Capture what you tasted, structured or freeform."
      showBack
      backUrl="/dashboard"
      headerRight={helpButton}
      containerSize="2xl"
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-line bg-white/90 p-6 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.18)] sm:p-8">
          <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">Main actions</p>
          <h2 className="mt-2 text-h2 font-semibold tracking-tight text-fg">
            Start with structure, or just write what landed.
          </h2>
          <p className="mt-3 max-w-2xl text-body-sm leading-relaxed text-fg-muted">
            Use the structured form when you want consistency. Use quick note mode when the
            session needs less friction.
          </p>

          <div className="mt-6 grid gap-4">
            {primaryOptions.map((opt, index) => (
              <ModeCard key={opt.href} {...opt} delay={index * 0.06} />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-line bg-bg-surface p-6 shadow-sm">
            <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">
              More options
            </p>
            <div className="mt-4 grid gap-4">
              {secondaryOptions.map((opt, index) => (
                <ModeCard key={opt.href} {...opt} delay={0.04 + index * 0.06} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-dashed border-line bg-[#fbfaf7] p-6">
            <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">
              Review archive
            </p>
            <p className="mt-3 text-body-sm leading-relaxed text-fg-muted">
              Turn tastings into readable records, then come back through history when you want
              to compare notes.
            </p>
          </div>
        </aside>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </PageLayout>
  );
}
