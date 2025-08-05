"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { Toaster } from "./components/ui/toaster"

// Import pages
import Portfolio from "./pages/home"
import Login from "./pages/login"
import Register from "./pages/register"
import Dashboard from "./pages/userDashboard"
import AdminDashboard from "./pages/adminDashboard"
import WheelGame from "./pages/wheelGame"
import Leaderboard from "./pages/leaderboard"
import CommunityVoting from "./pages/voting"
import QuizzChallengeAdmin from "./pages/QuizzChallenge"
import Statistics from "./pages/adminSection/Statistics"
import Users from "./pages/adminSection/Users"
import History from "./pages/adminSection/History"
import Export from "./pages/adminSection/Export"
import SdgManagement from "./pages/adminSection/SdgManagement"
import VerifyNotice from "./pages/verifyNotice";
import Verify from "./pages/verify"

// Protected Route Component
import { useAuth } from "./contexts/AuthContext"

function ProtectedRoute({ children, adminOnly = false, userOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // NEW: Prevent admins from accessing user-only pages
  if (userOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Portfolio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-notice" element={<VerifyNotice />} />
          <Route path="/verify/:token" element={<Verify />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute userOnly>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wheel"
            element={
              <ProtectedRoute userOnly>
                <WheelGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute userOnly>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute userOnly>
                <CommunityVoting />
              </ProtectedRoute>
            }
          />

          {/* Admin only routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminSection/QuizzChallenge"
            element={
              <ProtectedRoute adminOnly>
                <QuizzChallengeAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminSection/Statistics"
            element={
              <ProtectedRoute adminOnly>
                <Statistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminSection/Users"
            element={
              <ProtectedRoute adminOnly>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminSection/History"
            element={
              <ProtectedRoute adminOnly>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminSection/Export"
            element={
              <ProtectedRoute adminOnly>
                <Export />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminSection/SdgManagement"
            element={
              <ProtectedRoute adminOnly>
                <SdgManagement />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </AuthProvider>
  )
}

export default App
