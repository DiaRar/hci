import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AuthPage } from './pages/AuthPage';
import { ChatPage } from './pages/ChatPage';
import { CreatePage } from './pages/CreatePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { EventPage } from './pages/EventPage';
import { ProfilePage } from './pages/ProfilePage';
import { useBubbleStore } from './store/BubbleStore';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/event/:eventId" element={<EventPage />} />
        <Route path="/chat/:eventId" element={<ChatPage />} />
        <Route path="/profile/me" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RootRedirect() {
  const { currentUser } = useBubbleStore();

  return <Navigate to={currentUser ? '/discover' : '/auth'} replace />;
}

function ProtectedRoutes() {
  const { currentUser } = useBubbleStore();

  return currentUser ? <Outlet /> : <Navigate to="/auth" replace />;
}

export default App;
