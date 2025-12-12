import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/UIComponents';
import { Icons } from '../components/Icons';
import { useData } from '../context/DataContext';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useData();

  return (
    <div className="flex flex-col gap-8 pb-24">
      <div className="flex flex-col items-center pt-8">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-card mb-4 bg-gray-200">
           <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-textDark">{user.name}</h1>
        <p className="text-textGray text-sm">{user.handle}</p>
        <Button 
          variant="outline" 
          className="mt-4 h-9 text-sm px-6"
          onClick={() => navigate('/profile/edit')}
        >
          Edit Profile
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-2">
         {[
           { label: 'Tastings', val: user.stats.tastings },
           { label: 'Wheels', val: user.stats.wheels },
           { label: 'Reviews', val: user.stats.reviews },
         ].map((stat) => (
           <Card key={stat.label} className="flex flex-col items-center justify-center py-4 px-2">
             <span className="text-2xl font-bold text-primary">{stat.val}</span>
             <span className="text-xs text-textGray mt-1">{stat.label}</span>
           </Card>
         ))}
      </div>

      {/* Settings List */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold px-1 text-textDark">Settings</h3>
        <Card className="p-0 overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Icons.Settings size={20} className="text-textGray" />
              <span className="font-medium text-sm text-textDark">Preferences</span>
            </div>
            <Icons.ChevronRight size={16} className="text-gray-300" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Icons.Share size={20} className="text-textGray" />
              <span className="font-medium text-sm text-textDark">Invite Friends</span>
            </div>
            <Icons.ChevronRight size={16} className="text-gray-300" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-red-500 transition-colors">
            <div className="flex items-center gap-3">
              <Icons.LogOut size={20} />
              <span className="font-medium text-sm">Log Out</span>
            </div>
          </button>
        </Card>
      </div>
      
      <div className="text-center text-[10px] text-gray-400 mt-4">
        Flavatix v1.0 • Build 240
      </div>
    </div>
  );
};
