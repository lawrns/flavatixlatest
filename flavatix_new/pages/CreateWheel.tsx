import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/UIComponents';
import { Icons } from '../components/Icons';
import { useData } from '../context/DataContext';

export const CreateWheel: React.FC = () => {
  const navigate = useNavigate();
  const { addWheel } = useData();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Hardcoded presets for simplicity in this version
  const [segments, setSegments] = useState([
    { label: 'Sweet', value: 50, color: '#FFD700' },
    { label: 'Sour', value: 30, color: '#32CD32' },
    { label: 'Bitter', value: 20, color: '#A52A2A' },
  ]);

  const handleSave = () => {
    if (!name.trim()) return;
    
    addWheel({
      name,
      description: description || 'Custom flavor wheel',
      data: segments
    });
    
    navigate('/wheels');
  };

  const handleSegmentChange = (index: number, field: string, value: any) => {
     const newSegments = [...segments];
     (newSegments[index] as any)[field] = value;
     setSegments(newSegments);
  };

  return (
    <div className="flex flex-col h-full bg-bgApp pb-10">
      <div className="flex justify-between items-center py-4">
         <h1 className="text-2xl font-bold">New Wheel</h1>
         <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full">
           <Icons.Close size={20} />
         </button>
      </div>

      <div className="flex flex-col gap-6 flex-1 overflow-y-auto no-scrollbar pb-6">
        <section>
          <label className="block text-sm font-bold text-textDark mb-3">Wheel Name</label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Morning Espresso" 
          />
        </section>

        <section>
          <label className="block text-sm font-bold text-textDark mb-3">Description</label>
          <textarea 
            className="w-full bg-bgCard rounded-card p-4 text-textDark min-h-[80px] focus:outline-none text-sm"
            placeholder="What does this wheel represent?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </section>

        <section>
          <label className="block text-sm font-bold text-textDark mb-3">Segments</label>
          <div className="flex flex-col gap-3">
            {segments.map((seg, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-bgCard p-2 rounded-xl">
                 <div className="w-8 h-8 rounded-full shadow-sm border border-gray-200" style={{backgroundColor: seg.color}}></div>
                 <div className="flex-1">
                   <input 
                     className="bg-transparent text-sm font-semibold w-full focus:outline-none"
                     value={seg.label}
                     onChange={(e) => handleSegmentChange(idx, 'label', e.target.value)}
                   />
                 </div>
                 <input 
                   type="number"
                   className="w-16 bg-white rounded-lg p-1 text-center text-sm"
                   value={seg.value}
                   onChange={(e) => handleSegmentChange(idx, 'value', parseInt(e.target.value))}
                 />
              </div>
            ))}
          </div>
          <button className="mt-3 text-primary text-sm font-medium flex items-center gap-1" disabled>
            <Icons.Plus size={16} /> Add Segment (Max 3 in demo)
          </button>
        </section>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <Button fullWidth onClick={handleSave}>Create Wheel</Button>
      </div>
    </div>
  );
};
