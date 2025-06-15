"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Users, Car, AlertTriangle, TrendingUp, Activity, Shield } from "lucide-react"
import "./Dashboard.css"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalVehicles: 0,
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedIncidents: 0,
    criticalIncidents: 0,
  })
  const [recentIncidents, setRecentIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [incidentsRes] = await Promise.all([axios.get("/api/incidents")])

      const incidents = incidentsRes.data.incidents

      setStats({
        totalDrivers: 25, // Mock data
        totalVehicles: 15, // Mock data
        totalIncidents: incidents.length,
        activeIncidents: incidents.filter((i) => !i.resolved).length,
        resolvedIncidents: incidents.filter((i) => i.resolved).length,
        criticalIncidents: incidents.filter((i) => i.severity === "critical").length,
      })

      setRecentIncidents(incidents.slice(0, 5))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Monitor and manage driver safety across your fleet</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{stats.totalDrivers}</h3>
            <p>Total Drivers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon vehicles">
            <Car />
          </div>
          <div className="stat-content">
            <h3>{stats.totalVehicles}</h3>
            <p>Total Vehicles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon incidents">
            <AlertTriangle />
          </div>
          <div className="stat-content">
            <h3>{stats.totalIncidents}</h3>
            <p>Total Incidents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <Activity />
          </div>
          <div className="stat-content">
            <h3>{stats.activeIncidents}</h3>
            <p>Active Incidents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon resolved">
            <Shield />
          </div>
          <div className="stat-content">
            <h3>{stats.resolvedIncidents}</h3>
            <p>Resolved Incidents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon critical">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <h3>{stats.criticalIncidents}</h3>
            <p>Critical Incidents</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-incidents">
          <h2>Recent Incidents</h2>
          <div className="incidents-list">
            {recentIncidents.length > 0 ? (
              recentIncidents.map((incident) => (
                <div key={incident._id} className="incident-item">
                  <div className={`incident-severity ${incident.severity}`}>{incident.severity}</div>
                  <div className="incident-details">
                    <h4>{incident.type.replace("_", " ").toUpperCase()}</h4>
                    <p>{incident.description}</p>
                    <small>
                      Driver: {incident.driverId?.name} | Vehicle: {incident.vehicleId?.vehicleNumber} |
                      {new Date(incident.timestamp).toLocaleDateString()}
                    </small>
                  </div>
                  <div className={`incident-status ${incident.resolved ? "resolved" : "active"}`}>
                    {incident.resolved ? "Resolved" : "Active"}
                  </div>
                </div>
              ))
            ) : (
              <p>No incidents found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
