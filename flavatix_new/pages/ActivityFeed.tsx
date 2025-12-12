import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useData } from '../context/DataContext';

export const ActivityFeed: React.FC = () => {
  const navigate = useNavigate();
  const { activities } = useData();

  return (
    <div className="flex flex-col gap-6 pb-24 h-full">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 pt-2 pb-4 border-b border-gray-100 -mx-6 px-6">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
               <Icons.ChevronRight size={24} className="rotate-180 text-textGray" />
            </button>
            <h1 className="text-2xl font-bold">Activity Feed</h1>
         </div>
      </div>

      <div className="flex flex-col gap-6">
         {activities.map((activity, index) => (
           <div 
             key={activity.id} 
             className="flex gap-4 relative cursor-pointer active:opacity-70 transition-opacity"
             onClick={() => navigate(`/activity/${activity.id}`)}
           >
             {/* Timeline line */}
             {index !== activities.length - 1 && (
               <div className="absolute left-[27px] top-14 bottom-[-24px] w-0.5 bg-gray-100"></div>
             )}
             
             <div className="w-14 h-14 rounded-2xl bg-bgCard border border-gray-100 flex items-center justify-center shrink-0 z-0">
               {activity.type === 'tasting' && <Icons.Wine className="text-primary" size={24} />}
               {activity.type === 'wheel' && <Icons.Wheels className="text-blue-500" size={24} />}
               {activity.type === 'review' && <Icons.Star className="text-yellow-500" size={24} />}
               {activity.type === 'social' && <Icons.Profile className="text-green-500" size={24} />}
             </div>
             
             <div className="flex-1 pt-1 pb-4 border-b border-gray-50">
               <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-textDark text-sm">{activity.title}</h3>
                  <span className="text-[10px] text-textGray">{activity.date}</span>
               </div>
               <p className="text-xs text-textGray mt-1">{activity.subtitle}</p>
             </div>
           </div>
         ))}
         
         {activities.length === 0 && (
           <div className="text-center py-10 text-gray-400">
             No activity yet.
           </div>
         )}
      </div>
    </div>
  );
};
