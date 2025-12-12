import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { TastingsList } from './pages/TastingsList';
import { CreateTasting } from './pages/CreateTasting';
import { WheelsPage } from './pages/WheelsPage';
import { CreateWheel } from './pages/CreateWheel';
import { Profile } from './pages/Profile';
import { ReviewsPage } from './pages/ReviewsPage';
import { ActivityFeed } from './pages/ActivityFeed';
import { TastingDetails } from './pages/TastingDetails';
import { WheelDetails } from './pages/WheelDetails';
import { ActivityDetails } from './pages/ActivityDetails';
import { EditProfile } from './pages/EditProfile';
import { BottomNav, FloatingActionButton } from './components/Navigation';
import { DataProvider } from './context/DataContext';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isFullScreen = ['/quick-tasting', '/create-wheel', '/profile/edit'].includes(location.pathname);
  const hideNav = location.pathname.includes('/tastings/') && location.pathname !== '/tastings' 
               || location.pathname.includes('/wheels/') && location.pathname !== '/wheels'
               || location.pathname.includes('/activity/') && location.pathname !== '/activity'; 

  return (
    <div className="min-h-screen bg-bgApp text-textDark font-sans selection:bg-primary/20">
      <main className={`max-w-md mx-auto min-h-screen bg-white shadow-2xl relative ${isFullScreen ? 'p-6' : 'px-6 pt-6'}`}>
        {children}
        {!isFullScreen && !hideNav && <FloatingActionButton />}
        {!isFullScreen && !hideNav && <BottomNav />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tastings" element={<TastingsList />} />
            <Route path="/tastings/:id" element={<TastingDetails />} />
            <Route path="/quick-tasting" element={<CreateTasting />} />
            <Route path="/wheels" element={<WheelsPage />} />
            <Route path="/wheels/:id" element={<WheelDetails />} />
            <Route path="/create-wheel" element={<CreateWheel />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/activity" element={<ActivityFeed />} />
            <Route path="/activity/:id" element={<ActivityDetails />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
      </HashRouter>
    </DataProvider>
  );
};

export default App;
