import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { Button, CategoryIcon, Card } from '../components/UIComponents';
import { useData } from '../context/DataContext';

export const TastingDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tastings, deleteTasting } = useData();
  
  const tasting = tastings.find(t => t.id === id);

  if (!tasting) {
    return (
      <div className="pt-20 text-center">
        <p className="text-textGray">Tasting not found.</p>
        <Button onClick={() => navigate('/tastings')} className="mt-4" variant="ghost">Go Back</Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this tasting?')) {
      deleteTasting(tasting.id);
      navigate('/tastings');
    }
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Navbar overlay */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 -mx-6 px-6 py-4 flex items-center justify-between border-b border-gray-100">
         <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-textDark hover:bg-gray-100 rounded-full">
           <Icons.ChevronRight size={24} className="rotate-180" />
         </button>
         <span className="font-semibold text-sm">Tasting Details</span>
         <button onClick={handleDelete} className="p-2 -mr-2 text-red-500 hover:bg-red-50 rounded-full">
           <Icons.LogOut size={20} /> {/* Using LogOut as Delete icon proxy or Trash if available */}
         </button>
      </div>

      <div className="flex flex-col gap-6 pt-6">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-4 shadow-sm border border-gray-100">
             <CategoryIcon category={tasting.category} />
          </div>
          <h1 className="text-2xl font-bold text-textDark">{tasting.title}</h1>
          <p className="text-textGray mt-1 text-sm">{tasting.date} • {tasting.itemsTasted} Item(s)</p>
          
          <div className="flex items-center gap-2 mt-4">
             <div className="flex px-3 py-1 bg-primary/10 rounded-full text-primary font-bold text-sm items-center gap-1">
               <Icons.Star size={14} fill="currentColor" />
               {tasting.score.toFixed(1)}
             </div>
             <div className="px-3 py-1 bg-gray-100 rounded-full text-textGray text-sm">
               {tasting.category}
             </div>
          </div>
        </div>

        {/* Notes Section */}
        <Card className="flex flex-col gap-3">
          <h3 className="font-bold text-textDark text-sm flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            Flavor Notes
          </h3>
          {tasting.notes && tasting.notes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tasting.notes.map((note, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-gray-100 text-textDark text-xs font-medium rounded-lg">
                  {note}
                </span>
              ))}
            </div>
          ) : (
             <p className="text-textGray text-sm italic">No specific flavor tags.</p>
          )}
          
          {tasting.description && (
            <div className="mt-2 pt-3 border-t border-gray-100">
              <p className="text-textDark text-sm leading-relaxed">{tasting.description}</p>
            </div>
          )}
        </Card>

        {/* Placeholder for future sections */}
        <Card className="opacity-75">
           <div className="flex items-center justify-between mb-2">
             <h3 className="font-bold text-textDark text-sm">Origin Info</h3>
             <span className="text-[10px] text-textGray bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
           </div>
           <p className="text-xs text-textGray">Detailed origin maps and producer information will appear here.</p>
        </Card>
      </div>
    </div>
  );
};
