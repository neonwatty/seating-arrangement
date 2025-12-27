// React Router v6 with HashRouter for GitHub Pages compatibility
import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LandingPage } from '../components/LandingPage';
import { EventListView } from '../components/EventListView';
import { QRTableInfoPage } from '../components/QRTableInfoPage';
import { ShareableViewPage } from '../components/ShareableViewPage';
import { EventLayout } from './EventLayout';
import { DashboardView } from '../components/DashboardView';
import { Canvas } from '../components/Canvas';
import { Sidebar } from '../components/Sidebar';
import { GuestManagementView } from '../components/GuestManagementView';
import { trackPageView } from '../utils/analytics';

function CanvasView() {
  return (
    <>
      <Sidebar />
      <Canvas />
    </>
  );
}

// Track page views on route changes
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    // Map routes to human-readable page titles
    const getPageTitle = (pathname: string): string => {
      if (pathname === '/') return 'Landing Page';
      if (pathname === '/events') return 'Event List';
      if (pathname.includes('/dashboard')) return 'Dashboard';
      if (pathname.includes('/canvas')) return 'Canvas';
      if (pathname.includes('/guests')) return 'Guest Management';
      if (pathname.includes('/table/')) return 'Table QR Info';
      if (pathname.includes('/share')) return 'Shared View';
      return 'Seatify';
    };

    trackPageView(location.pathname, getPageTitle(location.pathname));
  }, [location.pathname]);

  return null;
}

export function AppRouter() {
  return (
    <HashRouter>
      <PageViewTracker />
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Event list */}
        <Route path="/events" element={<EventLayout />}>
          <Route index element={<EventListView />} />
        </Route>

        {/* Event views with nested routes */}
        <Route path="/events/:eventId" element={<EventLayout />}>
          {/* Default redirect to canvas */}
          <Route index element={<Navigate to="canvas" replace />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="canvas" element={<CanvasView />} />
          <Route path="guests" element={<GuestManagementView />} />
        </Route>

        {/* QR code table info page */}
        <Route path="/table/:encodedData" element={<QRTableInfoPage />} />

        {/* Shareable read-only view */}
        <Route path="/share/:encodedData" element={<ShareableViewPage />} />
        <Route path="/share" element={<ShareableViewPage />} />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
