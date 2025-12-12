import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CategoryIcon, Button, Input } from '../components/UIComponents';
import { Icons } from '../components/Icons';

export const ReviewsPage: React.FC = () => {
  const { reviews, addReview } = useData();
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Coffee');

  const handleSubmit = () => {
    if (!title || !text) return;
    addReview({
      title,
      text,
      rating,
      category
    });
    setIsCreating(false);
    setTitle('');
    setText('');
    setRating(5);
  };

  if (isCreating) {
    return (
      <div className="flex flex-col h-full bg-bgApp pb-24">
         <div className="flex justify-between items-center py-4 mb-2">
           <h1 className="text-2xl font-bold">Write Review</h1>
           <button onClick={() => setIsCreating(false)} className="p-2 bg-gray-100 rounded-full">
             <Icons.Close size={20} />
           </button>
         </div>
         
         <div className="flex flex-col gap-6">
            <div>
              <label className="text-sm font-bold block mb-2">Item Name</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you reviewing?" />
            </div>

            <div>
              <label className="text-sm font-bold block mb-2">Category</label>
              <div className="flex gap-2">
                {['Coffee', 'Wine', 'Chocolate'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${category === c ? 'bg-primary text-white' : 'bg-bgCard text-textGray'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold block mb-2">Rating: {rating}</label>
              <input 
                type="range" min="1" max="5" step="0.1" 
                value={rating} onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <label className="text-sm font-bold block mb-2">Review</label>
              <textarea 
                 value={text} 
                 onChange={(e) => setText(e.target.value)}
                 className="w-full bg-bgCard rounded-card p-4 min-h-[150px] focus:outline-none"
                 placeholder="Share your thoughts..."
              />
            </div>

            <Button onClick={handleSubmit}>Post Review</Button>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-textDark">Reviews</h1>
          <p className="text-textGray mt-1">Your flavor journal</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="p-3 bg-primary text-white rounded-full shadow-lg shadow-primary/20">
          <Icons.Plus size={24} />
        </button>
      </header>

      <div className="flex flex-col gap-4">
        {reviews.map(review => (
          <Card key={review.id} className="flex flex-col gap-3">
             <div className="flex justify-between items-start">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <CategoryIcon category={review.category} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-textDark">{review.title}</h3>
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-500">
                        {[1,2,3,4,5].map(i => (
                          <Icons.Star key={i} size={10} fill={i <= Math.round(review.rating) ? "currentColor" : "none"} strokeWidth={i <= Math.round(review.rating) ? 0 : 2} className={i > Math.round(review.rating) ? "text-gray-300" : ""} />
                        ))}
                      </div>
                      <span className="text-xs text-textGray ml-1">{review.date}</span>
                    </div>
                  </div>
               </div>
               <span className="text-xs font-bold text-primary bg-red-50 px-2 py-1 rounded-md">{review.rating}</span>
             </div>
             <p className="text-sm text-textDark leading-relaxed bg-gray-50 p-3 rounded-xl">
               "{review.text}"
             </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
