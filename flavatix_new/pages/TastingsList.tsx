import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Badge, CategoryIcon } from '../components/UIComponents';
import { Icons } from '../components/Icons';
import { useData } from '../context/DataContext';

const CATEGORIES = ['All', 'Coffee', 'Wine', 'Chocolate', 'Other'];

export const TastingsList: React.FC = () => {
  const navigate = useNavigate();
  const { tastings } = useData();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filteredTastings = tastings.filter(t => 
    (activeCategory === 'All' || t.category === activeCategory) &&
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 pb-24 h-full">
      <div className="sticky top-0 bg-bgApp/95 backdrop-blur-sm z-10 pt-2 pb-4 space-y-4">
         <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Tastings</h1>
            <button className="p-2 text-primary hover:bg-red-50 rounded-full transition-colors">
              <Icons.Filter size={20} />
            </button>
         </div>

         <Input 
           placeholder="Search tastings..." 
           icon={<Icons.Search size={18} />} 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
         />

         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {CATEGORIES.map(cat => (
             <Badge 
               key={cat} 
               label={cat} 
               active={activeCategory === cat} 
               onClick={() => setActiveCategory(cat)} 
             />
           ))}
         </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredTastings.map(tasting => (
          <Card key={tasting.id} onClick={() => navigate(`/tastings/${tasting.id}`)} className="flex flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-bgCard border border-gray-100 flex items-center justify-center shrink-0">
               <CategoryIcon category={tasting.category} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-textDark truncate">{tasting.title}</h3>
                <span className="text-xs text-textGray whitespace-nowrap ml-2">{tasting.date}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-primary">
                  <Icons.Star size={12} fill="currentColor" />
                  <span className="text-xs font-bold">{tasting.score.toFixed(1)}</span>
                </div>
                <span className="text-xs text-textGray">•</span>
                <span className="text-xs text-textGray">{tasting.category}</span>
              </div>
            </div>
            <Icons.ChevronRight className="text-iconGray shrink-0" size={18} />
          </Card>
        ))}
        
        {filteredTastings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-3 text-gray-400">
               <Icons.Search size={24} />
            </div>
            <p className="text-textGray font-medium">No tastings found.</p>
            <p className="text-textGray text-xs mt-1">Try adjusting your filters or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};
