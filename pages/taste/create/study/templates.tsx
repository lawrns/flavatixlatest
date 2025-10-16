import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft } from 'lucide-react';
import { STUDY_MODE_TEMPLATES, getStudyModeTemplateById } from '@/lib/templates/tastingTemplates';

const TemplatesPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleSelectTemplate = async (templateId: string) => {
    const template = getStudyModeTemplateById(templateId);
    if (!template) return;

    router.push({
      pathname: '/taste/create/study/new',
      query: { templateId }
    });
  };

  if (loading) return <div className="min-h-screen bg-background-light flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!user) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen pb-20">
      <main className="container mx-auto px-md py-lg max-w-4xl">
        <div className="mb-lg">
          <button onClick={() => router.back()} className="flex items-center text-text-secondary hover:text-text-primary mb-sm transition-colors">
            <ChevronLeft size={20} className="mr-2" />Back
          </button>
          <h1 className="text-h1 font-heading font-bold text-text-primary mb-xs">Choose Template</h1>
          <p className="text-body text-text-secondary">Select a preset tasting protocol</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <button onClick={() => router.push('/taste/create/study/new')} className="card p-md text-left hover:shadow-lg transition-all">
            <h3 className="font-heading font-semibold text-lg mb-2">My Templates</h3>
            <p className="text-sm text-text-secondary">Your saved custom templates</p>
          </button>

          {STUDY_MODE_TEMPLATES.map(template => (
            <button key={template.id} onClick={() => handleSelectTemplate(template.id)} className="card p-md text-left hover:shadow-lg transition-all">
              <h3 className="font-heading font-semibold text-lg mb-2">{template.name}</h3>
              <p className="text-sm text-text-secondary mb-2">{template.description}</p>
              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded">{template.baseCategory}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TemplatesPage;

// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
