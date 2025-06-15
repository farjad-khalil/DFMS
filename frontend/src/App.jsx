"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./context/AuthContext"
import { useAuth } from "./context/AuthContext"
import Navbar from "./components/Layout/NavBar"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import Dashboard from "./components/Dashboard/Dashboard"
import DriverDashboard from "./components/Dashboard/DriverDashboard"
import AdminDashboard from "./components/Dashboard/AdminDashboard"
import IncidentList from "./components/Incidents/IncidentList"
import IncidentForm from "./components/Incidents/IncidentForm"
import VehicleList from "./components/Vehicles/VehicleList"
import DriverList from "./components/Drivers/DriverList"
import Reports from "./components/Reports/Reports"
import "./App.css"

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />
  }

  return children
}

// App Routes Component
const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <AdminDashboard />
                ) : user?.role === "manager" ? (
                  <Dashboard />
                ) : (
                  <DriverDashboard />
                )}
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <IncidentList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents/new"
            element={
              <ProtectedRoute allowedRoles={["driver"]}>
                <IncidentForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicles"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <VehicleList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/drivers"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <DriverList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
