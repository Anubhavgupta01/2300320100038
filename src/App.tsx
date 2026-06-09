import { useEffect } from 'react';
import { NotificationsPage } from './pages/NotificationsPage';
import { Log } from './utils/logger';

function App() {
  useEffect(() => {
    // Log "App loaded" as requested in requirements
    Log('info', 'component', 'App loaded: Campus Notifications web dashboard successfully initialized.');
  }, []);

  return (
    <>
      <NotificationsPage />
    </>
  );
}

export default App;
