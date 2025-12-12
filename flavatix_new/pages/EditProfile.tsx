import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/UIComponents';
import { Icons } from '../components/Icons';
import { useData } from '../context/DataContext';

export const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useData();
  
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  
  const handleSave = () => {
    if (name.trim()) {
      updateUser({ 
        name, 
        handle: handle.startsWith('@') ? handle : `@${handle}`
      });
      navigate('/profile');
    }
  };

  return (
    <div className="flex flex-col h-full bg-bgApp pb-10">
      <div className="flex justify-between items-center py-4">
         <h1 className="text-2xl font-bold">Edit Profile</h1>
         <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
           <Icons.Close size={20} />
         </button>
      </div>

      <div className="flex flex-col gap-6 flex-1 overflow-y-auto no-scrollbar pt-4">
        
        <div className="flex flex-col items-center">
           <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-card mb-4 bg-gray-200 relative group cursor-pointer">
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Icons.Plus className="text-white" />
              </div>
           </div>
           <p className="text-primary text-sm font-medium">Change Photo</p>
        </div>

        <section>
          <label className="block text-sm font-bold text-textDark mb-3">Display Name</label>
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            icon={<Icons.Profile size={18} />}
          />
        </section>

        <section>
          <label className="block text-sm font-bold text-textDark mb-3">Handle</label>
          <Input 
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@username"
            icon={<span className="text-lg font-bold">@</span>}
          />
        </section>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button fullWidth onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};
