import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { ChevronLeft, Plus } from 'lucide-react';
import { STUDY_MODE_TEMPLATES, getStudyModeTemplateById } from '@/lib/templates/tastingTemplates';
import { getSupabaseClient } from '@/lib/supabase';

const TemplatesPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [userTemplates, setUserTemplates] = React.useState<any[]>([]);
  const supabase = getSupabaseClient();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (user) {
      const fetchUserTemplates = async () => {
        const { data, error } = await supabase
          .from('study_templates')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (data) {
          setUserTemplates(data);
        }
      };
      fetchUserTemplates();
    }
  }, [user]);

  const handleSelectTemplate = async (templateId: string) => {
    const template = getStudyModeTemplateById(templateId);
    if (!template) return;

    router.push({
      pathname: '/taste/create/study/new',
      query: { templateId }
    });
  };

  const handleSelectUserTemplate = (templateId: string) => {
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
          <button onClick={() => router.push('/taste/create/study/new')} className="card p-md text-left hover:shadow-lg transition-all border-2 border-dashed border-primary-200 flex flex-col justify-center items-center text-center min-h-[160px]">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 text-primary-600">
              <Plus size={24} />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-1 text-primary-600">Create New</h3>
            <p className="text-sm text-text-secondary">Start from scratch</p>
          </button>

          {userTemplates.map(template => (
            <button key={template.id} onClick={() => handleSelectUserTemplate(template.id)} className="card p-md text-left hover:shadow-lg transition-all relative group">
              <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-1 rounded">Custom</div>
              <h3 className="font-heading font-semibold text-lg mb-2">{template.name}</h3>
              <p className="text-sm text-text-secondary mb-3">Base: {template.base_category}</p>
              <span className="text-xs text-text-secondary">Created {new Date(template.created_at).toLocaleDateString()}</span>
            </button>
          ))}

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
