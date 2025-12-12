import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { Button, Card } from '../components/UIComponents';
import { SimpleWheel } from '../components/Visualizations';
import { useData } from '../context/DataContext';

export const WheelDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wheels, deleteWheel } = useData();
  
  const wheel = wheels.find(w => w.id === id);

  if (!wheel) {
    return (
      <div className="pt-20 text-center">
        <p className="text-textGray">Wheel not found.</p>
        <Button onClick={() => navigate('/wheels')} className="mt-4" variant="ghost">Go Back</Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this wheel?')) {
      deleteWheel(wheel.id);
      navigate('/wheels');
    }
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Navbar overlay */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 -mx-6 px-6 py-4 flex items-center justify-between border-b border-gray-100">
         <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-textDark hover:bg-gray-100 rounded-full">
           <Icons.ChevronRight size={24} className="rotate-180" />
         </button>
         <span className="font-semibold text-sm">Wheel Details</span>
         <button onClick={handleDelete} className="p-2 -mr-2 text-red-500 hover:bg-red-50 rounded-full">
           <Icons.Close size={20} />
         </button>
      </div>

      <div className="flex flex-col gap-6 pt-6">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 relative">
             <div className="absolute inset-0 bg-gray-50 rounded-full transform scale-110 -z-10"></div>
             <SimpleWheel data={wheel.data} size={200} />
          </div>
          
          <h1 className="text-2xl font-bold text-textDark">{wheel.name}</h1>
          <p className="text-textGray mt-2 text-sm max-w-[280px]">{wheel.description}</p>
        </div>

        {/* Segments Section */}
        <Card className="flex flex-col gap-3">
          <h3 className="font-bold text-textDark text-sm flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            Flavor Profile
          </h3>
          <div className="flex flex-col gap-3 mt-2">
            {wheel.data.map((seg, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-textDark">{seg.label}</span>
                    <span className="text-xs text-textGray font-mono">{seg.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${seg.value}%`, backgroundColor: seg.color }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Info */}
        <Card className="bg-blue-50/50 border-none">
           <div className="flex gap-3">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0 h-fit">
               <Icons.Info size={20} />
             </div>
             <div>
               <h4 className="font-bold text-sm text-blue-900">About this Wheel</h4>
               <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                 This flavor wheel helps you identify and categorize tastes. Use it as a reference when tasting new items.
               </p>
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
};
