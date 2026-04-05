/**
 * Bubbleverse App Router
 *
 * This module defines the application's route structure using React Router v7.
 *
 * ============================================================================
 * ROUTE STRUCTURE
 * ============================================================================
 *
 * Public routes (no auth required):
 *   /           - Root redirect (checks auth, sends to /discover or /auth)
 *   /auth       - Login/signup page
 *
 * Protected routes (auth required):
 *   /discover           - Map view with event discovery
 *   /create             - Create new event form
 *   /event/:eventId      - Event detail page
 *   /chats               - List of all event chats
 *   /chat/:eventId       - Individual event chat
 *   /profile/me          - Current user's profile
 *   /profile/:userId     - Another user's profile (view-only)
 *
 * Catch-all:
 *   *           - Redirects to root (which then redirects based on auth)
 *
 * ============================================================================
 * AUTH FLOW
 * ============================================================================
 *
 * The ProtectedRoutes component wraps all authenticated routes.
 * It checks if currentUser exists in the store:
 *   - If yes: renders the nested routes via <Outlet />
 *   - If no: redirects to /auth
 *
 * After login, the user is redirected to /discover.
 * The RootRedirect component handles the initial redirect:
 *   - Logged in -> /discover
 *   - Not logged in -> /auth
 *
 * ============================================================================
 * NESTED ROUTING
 * ============================================================================
 *
 * ProtectedRoutes uses React Router's nested routing via <Outlet />.
 * This allows the auth guard to wrap multiple routes without duplicating
 * the guard logic. All routes inside the Route element with element={<ProtectedRoutes>}
 * will be protected.
 */

import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AuthPage } from './pages/AuthPage';
import { ChatPage } from './pages/ChatPage';
import { ChatsPage } from './pages/ChatsPage';
import { CreatePage } from './pages/CreatePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { EventPage } from './pages/EventPage';
import { ProfilePage } from './pages/ProfilePage';
import { useBubbleStore } from './store/BubbleStore';

/**
 * Root application component.
 * Defines all routes for the application.
 */
function App() {
  return (
    <Routes>
      {/* Root path - redirects based on auth state */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public authentication page */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoutes />}>
        {/* Main discovery/map view */}
        <Route path="/discover" element={<DiscoverPage />} />

        {/* Event creation wizard */}
        <Route path="/create" element={<CreatePage />} />

        {/* Event detail page with tabs (details, people, location, chat) */}
        <Route path="/event/:eventId" element={<EventPage />} />

        {/* Chats list - all conversations */}
        <Route path="/chats" element={<ChatsPage />} />

        {/* Individual event chat thread */}
        <Route path="/chat/:eventId" element={<ChatPage />} />

        {/* Current user's own profile (shorthand for /profile/:userId with own ID) */}
        <Route path="/profile/me" element={<ProfilePage />} />

        {/* View another user's profile */}
        <Route path="/profile/:userId" element={<ProfilePage />} />
      </Route>

      {/* Catch-all: redirect any unknown path to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Root redirect logic.
 * Checks if user is authenticated and redirects appropriately.
 */
function RootRedirect() {
  const { currentUser } = useBubbleStore();

  // If authenticated, go to discover. Otherwise go to auth.
  return <Navigate to={currentUser ? '/discover' : '/auth'} replace />;
}

/**
 * Auth guard wrapper for protected routes.
 *
 * This component:
 * 1. Reads the currentUser from the store
 * 2. If authenticated: renders the nested child routes via <Outlet />
 * 3. If not authenticated: redirects to /auth
 *
 * Using a wrapper component (rather than a hook) allows React Router's
 * nested routing to work correctly with the <Outlet /> pattern.
 */
function ProtectedRoutes() {
  const { currentUser } = useBubbleStore();

  return currentUser ? <Outlet /> : <Navigate to="/auth" replace />;
}

export default App;