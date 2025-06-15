"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { MapPin, AlertTriangle, Car } from "lucide-react"
import "./Incidents.css"

const IncidentForm = () => {
  const [formData, setFormData] = useState({
    vehicleId: "",
    type: "",
    severity: "",
    description: "",
    location: {
      latitude: "",
      longitude: "",
      address: "",
    },
    speed: "",
  })
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchVehicles()
    getCurrentLocation()
  }, [])

  const fetchVehicles = async () => {
    try {
      const res = await axios.get("/api/vehicles")
      setVehicles(res.data.vehicles)
    } catch (error) {
      console.error("Error fetching vehicles:", error)
      // Mock vehicles data for demo
      setVehicles([
        { _id: "1", vehicleNumber: "ABC-123", make: "Toyota", model: "Camry" },
        { _id: "2", vehicleNumber: "XYZ-789", make: "Honda", model: "Civic" },
        { _id: "3", vehicleNumber: "DEF-456", make: "Ford", model: "Focus" },
      ])
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
            },
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
          toast.error("Could not get current location")
        },
      )
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes("location.")) {
      const locationField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        location: {
          ...formData.location,
          latitude: Number.parseFloat(formData.location.latitude),
          longitude: Number.parseFloat(formData.location.longitude),
        },
        speed: formData.speed ? Number.parseInt(formData.speed) : undefined,
      }

      await axios.post("/api/incidents", submitData)
      toast.success("Incident reported successfully!")
      navigate("/incidents")
    } catch (error) {
      console.error("Error creating incident:", error)
      toast.error("Failed to report incident")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="incident-form-container">
      <div className="incident-form-header">
        <AlertTriangle className="form-icon" />
        <h1>Report Safety Incident</h1>
        <p>Please provide detailed information about the incident</p>
      </div>

      <form onSubmit={handleSubmit} className="incident-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vehicleId">Vehicle</label>
            <div className="input-group">
              <Car className="input-icon" />
              <select id="vehicleId" name="vehicleId" value={formData.vehicleId} onChange={handleChange} required>
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.vehicleNumber} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="type">Incident Type</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange} required>
              <option value="">Select Type</option>
              <option value="speeding">Speeding</option>
              <option value="harsh_braking">Harsh Braking</option>
              <option value="rapid_acceleration">Rapid Acceleration</option>
              <option value="accident">Accident</option>
              <option value="fatigue">Driver Fatigue</option>
              <option value="distraction">Driver Distraction</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="severity">Severity Level</label>
            <select id="severity" name="severity" value={formData.severity} onChange={handleChange} required>
              <option value="">Select Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="speed">Speed (km/h)</label>
            <input
              type="number"
              id="speed"
              name="speed"
              value={formData.speed}
              onChange={handleChange}
              placeholder="Enter speed at time of incident"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide detailed description of the incident..."
            rows="4"
            required
          />
        </div>

        <div className="location-section">
          <h3>
            <MapPin className="section-icon" />
            Location Information
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location.latitude">Latitude</label>
              <input
                type="number"
                step="any"
                id="location.latitude"
                name="location.latitude"
                value={formData.location.latitude}
                onChange={handleChange}
                placeholder="Latitude"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location.longitude">Longitude</label>
              <input
                type="number"
                step="any"
                id="location.longitude"
                name="location.longitude"
                value={formData.location.longitude}
                onChange={handleChange}
                placeholder="Longitude"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location.address">Address (Optional)</label>
            <input
              type="text"
              id="location.address"
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              placeholder="Street address or landmark"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/incidents")} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Reporting..." : "Report Incident"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default IncidentForm
