import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CategoryIcon } from '../components/UIComponents';
import { Icons } from '../components/Icons';
import { useData } from '../context/DataContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, tastings, activities } = useData();

  // Get top 3 recent tastings
  const recentTastings = tastings.slice(0, 3);
  
  // Get top 3 recent activities
  const recentActivities = activities.slice(0, 3);

  return (
    <div className="flex flex-col gap-8 pb-24 animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-textDark tracking-tight">Dashboard</h1>
          <p className="text-textGray mt-1 text-lg">Welcome back, {user.name} 👋</p>
        </div>
      </header>

      {/* Feature Cards */}
      <section className="grid grid-cols-3 gap-3">
        <Card onClick={() => navigate('/tastings')} className="flex flex-col items-center justify-center py-6 gap-3">
          <div className="p-3 bg-red-50 rounded-full text-primary">
            <Icons.Wine size={24} />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-sm">Tastings</h3>
            <span className="text-xs text-textGray">{user.stats.tastings} items</span>
          </div>
        </Card>
        
        <Card onClick={() => navigate('/wheels')} className="flex flex-col items-center justify-center py-6 gap-3">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Icons.Wheels size={24} />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-sm">Wheels</h3>
            <span className="text-xs text-textGray">{user.stats.wheels} saved</span>
          </div>
        </Card>

        <Card onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center py-6 gap-3">
          <div className="p-3 bg-gray-100 rounded-full text-gray-700">
            <Icons.Profile size={24} />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-sm">Profile</h3>
            <span className="text-xs text-textGray">Edit</span>
          </div>
        </Card>
      </section>

      {/* Recent Tastings */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-textDark">Recent Tastings</h2>
          <button onClick={() => navigate('/tastings')} className="text-sm font-medium text-primary hover:text-red-700 transition-colors">
            View All
          </button>
        </div>
        
        {recentTastings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentTastings.map((tasting) => (
              <Card key={tasting.id} onClick={() => navigate(`/tastings/${tasting.id}`)} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
                    <CategoryIcon category={tasting.category} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-textDark line-clamp-1">{tasting.title}</h3>
                    <p className="text-xs text-textGray">{tasting.category} • {tasting.itemsTasted} items</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-bold text-primary bg-red-50 px-2 py-0.5 rounded-lg">{tasting.score.toFixed(1)}</span>
                  <span className="text-[10px] text-textGray">{tasting.date}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-bgCard rounded-card">
            <p className="text-textGray text-sm">No tastings yet.</p>
            <button onClick={() => navigate('/quick-tasting')} className="text-primary font-medium text-sm mt-2">Start your first tasting</button>
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-textDark">Recent Activity</h2>
          <button onClick={() => navigate('/activity')} className="text-sm font-medium text-primary hover:text-red-700 transition-colors">
            View All
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-4 items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                  {activity.image && activity.image.startsWith('http') ? (
                     <img src={activity.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                     <span>📝</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-textDark text-sm line-clamp-1">{activity.title}</h4>
                    <span className="text-[10px] text-textGray whitespace-nowrap ml-2">{activity.date}</span>
                  </div>
                  <p className="text-xs text-textGray mt-0.5 line-clamp-1">{activity.subtitle}</p>
                  <div className="flex gap-2 mt-2">
                     <span className="text-[10px] font-medium px-2 py-1 bg-gray-100 rounded-md text-textGray uppercase tracking-wide">{activity.type}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-textGray text-sm italic">No recent activity.</p>
          )}
        </div>
      </section>
    </div>
  );
};
