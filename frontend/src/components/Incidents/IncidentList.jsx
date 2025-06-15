"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"
import { AlertTriangle, Plus, Eye, CheckCircle, MapPin } from "lucide-react"
import "./Incidents.css"

const IncidentList = () => {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    try {
      const res = await axios.get("/api/incidents")
      setIncidents(res.data.incidents)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching incidents:", error)
      toast.error("Failed to fetch incidents")
      setLoading(false)
    }
  }

  const handleResolveIncident = async (incidentId, notes = "") => {
    try {
      await axios.put(`/api/incidents/${incidentId}/resolve`, { notes })
      toast.success("Incident resolved successfully")
      fetchIncidents()
    } catch (error) {
      console.error("Error resolving incident:", error)
      toast.error("Failed to resolve incident")
    }
  }

  const filteredIncidents = incidents.filter((incident) => {
    if (filter === "all") return true
    if (filter === "active") return !incident.resolved
    if (filter === "resolved") return incident.resolved
    if (filter === "critical") return incident.severity === "critical"
    return true
  })

  if (loading) {
    return <div className="loading">Loading incidents...</div>
  }

  return (
    <div className="incidents-container">
      <div className="incidents-header">
        <div className="header-content">
          <h1>
            <AlertTriangle className="header-icon" />
            Safety Incidents
          </h1>
          <p>Monitor and manage safety incidents across your fleet</p>
        </div>
        {user.role === "driver" && (
          <Link to="/incidents/new" className="btn-primary">
            <Plus size={20} />
            Report Incident
          </Link>
        )}
      </div>

      <div className="incidents-filters">
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All ({incidents.length})
        </button>
        <button className={`filter-btn ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>
          Active ({incidents.filter((i) => !i.resolved).length})
        </button>
        <button className={`filter-btn ${filter === "resolved" ? "active" : ""}`} onClick={() => setFilter("resolved")}>
          Resolved ({incidents.filter((i) => i.resolved).length})
        </button>
        <button className={`filter-btn ${filter === "critical" ? "active" : ""}`} onClick={() => setFilter("critical")}>
          Critical ({incidents.filter((i) => i.severity === "critical").length})
        </button>
      </div>

      <div className="incidents-list">
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident) => (
            <div key={incident._id} className="incident-card">
              <div className="incident-header">
                <div className={`incident-severity ${incident.severity}`}>{incident.severity.toUpperCase()}</div>
                <div className={`incident-status ${incident.resolved ? "resolved" : "active"}`}>
                  {incident.resolved ? "Resolved" : "Active"}
                </div>
              </div>

              <div className="incident-content">
                <h3>{incident.type.replace("_", " ").toUpperCase()}</h3>
                <p className="incident-description">{incident.description}</p>

                <div className="incident-meta">
                  <div className="meta-item">
                    <strong>Driver:</strong> {incident.driverId?.name}
                  </div>
                  <div className="meta-item">
                    <strong>Vehicle:</strong> {incident.vehicleId?.vehicleNumber}
                  </div>
                  <div className="meta-item">
                    <strong>Date:</strong> {new Date(incident.timestamp).toLocaleDateString()}
                  </div>
                  {incident.speed && (
                    <div className="meta-item">
                      <strong>Speed:</strong> {incident.speed} km/h
                    </div>
                  )}
                </div>

                {incident.location && (
                  <div className="incident-location">
                    <MapPin size={16} />
                    <span>
                      {incident.location.address ||
                        `${incident.location.latitude.toFixed(4)}, ${incident.location.longitude.toFixed(4)}`}
                    </span>
                  </div>
                )}

                {incident.resolved && incident.resolvedBy && (
                  <div className="resolution-info">
                    <p>
                      <strong>Resolved by:</strong> {incident.resolvedBy.name}
                    </p>
                    <p>
                      <strong>Resolved on:</strong> {new Date(incident.resolvedAt).toLocaleDateString()}
                    </p>
                    {incident.notes && (
                      <p>
                        <strong>Notes:</strong> {incident.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="incident-actions">
                {!incident.resolved && (user.role === "admin" || user.role === "manager") && (
                  <button
                    onClick={() => {
                      const notes = prompt("Add resolution notes (optional):")
                      handleResolveIncident(incident._id, notes || "")
                    }}
                    className="btn-resolve"
                  >
                    <CheckCircle size={16} />
                    Resolve
                  </button>
                )}
                <button className="btn-view">
                  <Eye size={16} />
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-incidents">
            <AlertTriangle size={48} />
            <h3>No incidents found</h3>
            <p>{filter === "all" ? "No incidents have been reported yet." : `No ${filter} incidents found.`}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default IncidentList
