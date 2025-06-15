"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Shield, LogOut, User } from "lucide-react"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (!user) {
    return null
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <Shield className="navbar-icon" />
          <span>Driver Safety Monitor</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>

          <Link to="/incidents" className="navbar-link">
            Incidents
          </Link>

          {user.role === "driver" && (
            <Link to="/incidents/new" className="navbar-link">
              Report Incident
            </Link>
          )}

          {(user.role === "admin" || user.role === "manager") && (
            <>
              <Link to="/vehicles" className="navbar-link">
                Vehicles
              </Link>
              <Link to="/drivers" className="navbar-link">
                Drivers
              </Link>
              <Link to="/reports" className="navbar-link">
                Reports
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <User className="user-icon" />
            <span className="user-name">{user.name}</span>
            <span className="user-role">({user.role})</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
