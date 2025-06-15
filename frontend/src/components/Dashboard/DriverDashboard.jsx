"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { AlertTriangle, Car, Clock, CheckCircle } from "lucide-react"
import "./Dashboard.css"

const DriverDashboard = () => {
  const [incidents, setIncidents] = useState([])
  const [stats, setStats] = useState({
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedIncidents: 0,
    criticalIncidents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDriverData()
  }, [])

  const fetchDriverData = async () => {
    try {
      const res = await axios.get("/api/incidents")
      const driverIncidents = res.data.incidents

      setIncidents(driverIncidents.slice(0, 5))
      setStats({
        totalIncidents: driverIncidents.length,
        activeIncidents: driverIncidents.filter((i) => !i.resolved).length,
        resolvedIncidents: driverIncidents.filter((i) => i.resolved).length,
        criticalIncidents: driverIncidents.filter((i) => i.severity === "critical").length,
      })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching driver data:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Driver Dashboard</h1>
        <p>Monitor your safety incidents and performance</p>
      </div>

      <div className="stats-grid">
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
            <Clock />
          </div>
          <div className="stat-content">
            <h3>{stats.activeIncidents}</h3>
            <p>Active Incidents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon resolved">
            <CheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.resolvedIncidents}</h3>
            <p>Resolved Incidents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon critical">
            <Car />
          </div>
          <div className="stat-content">
            <h3>{stats.criticalIncidents}</h3>
            <p>Critical Incidents</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-incidents">
          <h2>My Recent Incidents</h2>
          <div className="incidents-list">
            {incidents.length > 0 ? (
              incidents.map((incident) => (
                <div key={incident._id} className="incident-item">
                  <div className={`incident-severity ${incident.severity}`}>{incident.severity}</div>
                  <div className="incident-details">
                    <h4>{incident.type.replace("_", " ").toUpperCase()}</h4>
                    <p>{incident.description}</p>
                    <small>
                      Vehicle: {incident.vehicleId?.vehicleNumber} | {new Date(incident.timestamp).toLocaleDateString()}
                    </small>
                  </div>
                  <div className={`incident-status ${incident.resolved ? "resolved" : "active"}`}>
                    {incident.resolved ? "Resolved" : "Active"}
                  </div>
                </div>
              ))
            ) : (
              <p>No incidents found. Keep up the safe driving!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DriverDashboard
