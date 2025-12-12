import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/UIComponents';
import { Icons } from '../components/Icons';
import { useData } from '../context/DataContext';

export const CreateTasting: React.FC = () => {
  const navigate = useNavigate();
  const { addTasting } = useData();
  
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const categories = [
    { id: 'Coffee', icon: Icons.Coffee, color: 'text-amber-700', bg: 'bg-amber-50' },
    { id: 'Wine', icon: Icons.Wine, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'Chocolate', icon: Icons.Chocolate, color: 'text-amber-900', bg: 'bg-amber-100' },
    { id: 'Other', icon: Icons.Other, color: 'text-gray-600', bg: 'bg-gray-100' },
  ];

  const handleSave = () => {
    if (!selectedCategory || rating === 0 || !title.trim()) {
      alert("Please select a category, provide a title, and set a rating.");
      return;
    }

    addTasting({
      title: title.trim(),
      category: selectedCategory as any,
      score: rating,
      itemsTasted: 1, // Default for quick tasting
      notes: notes.split('\n').filter(n => n.trim().length > 0),
      description: notes.trim(),
    });

    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-bgApp pb-10">
      {/* Header with close */}
      <div className="flex justify-between items-center py-4">
         <h1 className="text-2xl font-bold">Quick Tasting</h1>
         <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
           <Icons.Close size={20} />
         </button>
      </div>

      <p className="text-textGray mb-6">Rate this flavor in 30 seconds</p>

      <div className="flex flex-col gap-6 flex-1 overflow-y-auto no-scrollbar pb-6">
        
        {/* Title Input */}
        <section>
          <label className="block text-sm font-bold text-textDark mb-3">What are you tasting?</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ethiopian Yirgacheffe"
            className="w-full bg-bgCard rounded-card p-4 text-lg font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </section>

        {/* Category Selector */}
        <section>
          <label className="block text-sm font-bold text-textDark mb-3">Category</label>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${selectedCategory === cat.id ? 'border-primary bg-red-50' : 'border-transparent bg-bgCard hover:bg-gray-100'}`}
              >
                <div className={`p-2 rounded-full ${cat.bg} ${cat.color} mb-1`}>
                  <cat.icon size={20} />
                </div>
                <span className="text-[10px] font-medium">{cat.id}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Rating */}
        <section className="text-center">
          <label className="block text-sm font-bold text-textDark mb-4">Rating</label>
          <div className="flex justify-center gap-4">
             {[1, 2, 3, 4, 5].map((val) => (
               <button
                 key={val}
                 onClick={() => setRating(val)}
                 className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all ${rating >= val ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-bgCard text-textGray hover:bg-gray-200'}`}
               >
                 {val}
               </button>
             ))}
          </div>
        </section>

        {/* Notes */}
        <section>
          <label className="block text-sm font-bold text-textDark mb-3">Notes (Optional)</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-bgCard rounded-card p-4 text-textDark min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Describe the flavors..."
          />
        </section>

      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button fullWidth onClick={handleSave}>Save Tasting</Button>
      </div>
    </div>
  );
};
