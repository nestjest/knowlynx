import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/home/ui/HomePage';
import { SettingsPage } from '../pages/settings/ui/SettingsPage';
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
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
