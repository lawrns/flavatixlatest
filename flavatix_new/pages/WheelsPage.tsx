import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleWheel } from '../components/Visualizations';
import { Card, Button } from '../components/UIComponents';
import { Icons } from '../components/Icons';
import { useData } from '../context/DataContext';

export const WheelsPage: React.FC = () => {
  const navigate = useNavigate();
  const { wheels, deleteWheel } = useData();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm("Delete this wheel?")) {
      deleteWheel(id);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header>
        <h1 className="text-3xl font-bold text-textDark">Flavor Wheels</h1>
        <p className="text-textGray mt-1">Explore & create flavor profiles</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {wheels.map(wheel => (
          <Card 
            key={wheel.id} 
            className="flex flex-col gap-4 p-4 items-center text-center relative group cursor-pointer"
            onClick={() => navigate(`/wheels/${wheel.id}`)}
          >
            <button 
              onClick={(e) => handleDelete(e, wheel.id)}
              className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <Icons.Close size={16} />
            </button>
            <SimpleWheel data={wheel.data} size={100} />
            <div>
              <h3 className="font-bold text-textDark text-sm line-clamp-1">{wheel.name}</h3>
              <p className="text-[10px] text-textGray line-clamp-2 mt-1 leading-tight min-h-[2.5em]">{wheel.description}</p>
            </div>
            <Button variant="secondary" className="w-full text-xs h-8 py-0 pointer-events-none">View</Button>
          </Card>
        ))}
        
        {/* Create New Card */}
        <button 
          onClick={() => navigate('/create-wheel')}
          className="rounded-card border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 min-h-[200px] text-textGray hover:border-primary hover:text-primary transition-colors bg-gray-50/50"
        >
          <div className="p-3 bg-white rounded-full shadow-sm text-primary">
            <Icons.Plus size={24} />
          </div>
          <span className="text-xs font-medium">Create Wheel</span>
        </button>
      </div>
    </div>
  );
};
