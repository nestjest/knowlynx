import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/home/ui/HomePage';
import { SettingsControlsPage } from '../pages/settings/ui/SettingsControlsPage';
import { SettingsOverviewPage } from '../pages/settings/ui/SettingsOverviewPage';
import { ThreadsPage } from '../pages/threads/ui/ThreadsPage';
import { useAppStore } from '../shared/model/useAppStore';
import { createDashboardSocket } from '../shared/lib/ws/createDashboardSocket';

export function App() {
  const setConnectionStatus = useAppStore((state) => state.setConnectionStatus);

  useEffect(() => {
    const socket = createDashboardSocket({
      onOpen: () => setConnectionStatus('online'),
      onClose: () => setConnectionStatus('offline'),
      onError: () => setConnectionStatus('error')
    });

    return () => socket.disconnect();
  }, [setConnectionStatus]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/threads" element={<ThreadsPage />} />
      <Route path="/threads/:threadId" element={<ThreadsPage />} />
      <Route path="/settings" element={<SettingsOverviewPage />} />
      <Route path="/settings/:sectionId" element={<SettingsControlsPage />} />
    </Routes>
  );
}
