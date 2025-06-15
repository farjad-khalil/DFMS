"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { Car, Plus, Edit, Trash2, User } from "lucide-react"
import "./Vehicles.css"

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    make: "",
    model: "",
    year: "",
    fuelType: "",
    status: "active",
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const res = await axios.get("/api/vehicles")
      setVehicles(res.data.vehicles)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching vehicles:", error)
      toast.error("Failed to fetch vehicles")
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingVehicle) {
        await axios.put(`/api/vehicles/${editingVehicle._id}`, formData)
        toast.success("Vehicle updated successfully")
      } else {
        await axios.post("/api/vehicles", formData)
        toast.success("Vehicle created successfully")
      }
      setShowForm(false)
      setEditingVehicle(null)
      setFormData({
        vehicleNumber: "",
        make: "",
        model: "",
        year: "",
        fuelType: "",
        status: "active",
      })
      fetchVehicles()
    } catch (error) {
      console.error("Error saving vehicle:", error)
      toast.error("Failed to save vehicle")
    }
  }

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      fuelType: vehicle.fuelType,
      status: vehicle.status,
    })
    setShowForm(true)
  }

  const handleDelete = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await axios.delete(`/api/vehicles/${vehicleId}`)
        toast.success("Vehicle deleted successfully")
        fetchVehicles()
      } catch (error) {
        console.error("Error deleting vehicle:", error)
        toast.error("Failed to delete vehicle")
      }
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (loading) {
    return <div className="loading">Loading vehicles...</div>
  }

  return (
    <div className="vehicles-container">
      <div className="vehicles-header">
        <div className="header-content">
          <h1>
            <Car className="header-icon" />
            Fleet Management
          </h1>
          <p>Manage your vehicle fleet and assignments</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingVehicle(null)
            setFormData({
              vehicleNumber: "",
              make: "",
              model: "",
              year: "",
              fuelType: "",
              status: "active",
            })
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h2>
              <button onClick={() => setShowForm(false)} className="close-btn">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="vehicle-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vehicleNumber">Vehicle Number</label>
                  <input
                    type="text"
                    id="vehicleNumber"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="e.g., ABC-123"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="make">Make</label>
                  <input
                    type="text"
                    id="make"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    placeholder="e.g., Toyota"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="model">Model</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., Camry"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="year">Year</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g., 2023"
                    min="1900"
                    max="2030"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fuelType">Fuel Type</label>
                  <select id="fuelType" name="fuelType" value={formData.fuelType} onChange={handleChange} required>
                    <option value="">Select Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} required>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="vehicles-grid">
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <div key={vehicle._id} className="vehicle-card">
              <div className="vehicle-header">
                <h3>{vehicle.vehicleNumber}</h3>
                <div className={`vehicle-status ${vehicle.status}`}>{vehicle.status.toUpperCase()}</div>
              </div>

              <div className="vehicle-content">
                <div className="vehicle-info">
                  <p>
                    <strong>Make:</strong> {vehicle.make}
                  </p>
                  <p>
                    <strong>Model:</strong> {vehicle.model}
                  </p>
                  <p>
                    <strong>Year:</strong> {vehicle.year}
                  </p>
                  <p>
                    <strong>Fuel Type:</strong> {vehicle.fuelType}
                  </p>
                </div>

                {vehicle.driverId && (
                  <div className="vehicle-driver">
                    <User size={16} />
                    <span>Assigned to: {vehicle.driverId.name}</span>
                  </div>
                )}
              </div>

              <div className="vehicle-actions">
                <button onClick={() => handleEdit(vehicle)} className="btn-edit">
                  <Edit size={16} />
                  Edit
                </button>
                <button onClick={() => handleDelete(vehicle._id)} className="btn-delete">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-vehicles">
            <Car size={48} />
            <h3>No vehicles found</h3>
            <p>Add your first vehicle to get started with fleet management.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VehicleList
