import { Routes, Route } from "react-router-dom"
import Portfolio from "./pages/home"
import Login from "./pages/login"
import Register from "./pages/register"
import UserDashboard from "./pages/userDashboard"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}

export default App
