import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { Button, Card } from '../components/UIComponents';
import { useData } from '../context/DataContext';

export const ActivityDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activities, tastings, wheels } = useData();
  
  const activity = activities.find(a => a.id === id);

  if (!activity) {
    return (
      <div className="pt-20 text-center">
        <p className="text-textGray">Activity not found.</p>
        <Button onClick={() => navigate('/activity')} className="mt-4" variant="ghost">Go Back</Button>
      </div>
    );
  }

  // Find related item if possible
  const handleViewSource = () => {
    if (activity.targetId) {
      if (activity.type === 'tasting') navigate(`/tastings/${activity.targetId}`);
      else if (activity.type === 'wheel') navigate(`/wheels/${activity.targetId}`);
      else if (activity.type === 'review') navigate('/reviews'); // Reviews doesn't have detail page yet
      return;
    }

    // Fallback for old data or if targetId missing
    if (activity.type === 'tasting') {
       const tasting = tastings.find(t => t.title === activity.title);
       if (tasting) navigate(`/tastings/${tasting.id}`);
       else alert('Original tasting not found');
    } else if (activity.type === 'wheel') {
       // Title format "Created "Name"" -> extract Name
       const match = activity.title.match(/"([^"]+)"/);
       const name = match ? match[1] : activity.title;
       const wheel = wheels.find(w => w.name === name);
       if (wheel) navigate(`/wheels/${wheel.id}`);
       else alert('Original wheel not found');
    } else if (activity.type === 'review') {
       navigate('/reviews');
    } else {
       alert('No details available for this activity.');
    }
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Navbar overlay */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 -mx-6 px-6 py-4 flex items-center justify-between border-b border-gray-100">
         <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-textDark hover:bg-gray-100 rounded-full">
           <Icons.ChevronRight size={24} className="rotate-180" />
         </button>
         <span className="font-semibold text-sm">Activity Details</span>
         <div className="w-8"></div> {/* Spacer */}
      </div>

      <div className="flex flex-col gap-6 pt-8 items-center text-center">
        <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center shadow-sm border border-gray-100 text-4xl">
           {activity.type === 'tasting' && <Icons.Wine className="text-primary" size={48} />}
           {activity.type === 'wheel' && <Icons.Wheels className="text-blue-500" size={48} />}
           {activity.type === 'review' && <Icons.Star className="text-yellow-500" size={48} />}
           {activity.type === 'social' && <Icons.Profile className="text-green-500" size={48} />}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-textDark mb-2">{activity.title}</h1>
          <p className="text-textGray">{activity.subtitle}</p>
          <div className="inline-block mt-3 px-3 py-1 bg-gray-100 rounded-full text-xs font-mono text-textGray">
            {activity.date}
          </div>
        </div>

        <Card className="w-full mt-4 text-left">
           <h3 className="font-bold text-sm text-textDark mb-2">Activity Info</h3>
           <div className="space-y-3">
             <div className="flex justify-between py-2 border-b border-gray-50">
               <span className="text-textGray text-sm">Type</span>
               <span className="text-textDark text-sm font-medium capitalize">{activity.type}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-50">
               <span className="text-textGray text-sm">User</span>
               <span className="text-textDark text-sm font-medium">{activity.user.name}</span>
             </div>
             <div className="flex justify-between py-2">
               <span className="text-textGray text-sm">ID</span>
               <span className="text-textDark text-sm font-mono">{activity.id.slice(0, 8)}...</span>
             </div>
           </div>
        </Card>

        <Button onClick={handleViewSource} fullWidth>
          View Related Item
        </Button>
      </div>
    </div>
  );
};
