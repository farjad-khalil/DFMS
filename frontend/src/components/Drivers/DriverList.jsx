"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { Users, Edit, Trash2, Phone, Mail, CreditCard } from "lucide-react"
import "./Drivers.css"

const DriverList = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    isActive: true,
  })

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const res = await axios.get("/api/drivers")
      setDrivers(res.data.drivers)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching drivers:", error)
      toast.error("Failed to fetch drivers")
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingDriver) {
        await axios.put(`/api/drivers/${editingDriver._id}`, formData)
        toast.success("Driver updated successfully")
      }
      setShowForm(false)
      setEditingDriver(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        licenseNumber: "",
        isActive: true,
      })
      fetchDrivers()
    } catch (error) {
      console.error("Error saving driver:", error)
      toast.error("Failed to save driver")
    }
  }

  const handleEdit = (driver) => {
    setEditingDriver(driver)
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber || "",
      isActive: driver.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (driverId) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await axios.delete(`/api/drivers/${driverId}`)
        toast.success("Driver deleted successfully")
        fetchDrivers()
      } catch (error) {
        console.error("Error deleting driver:", error)
        toast.error("Failed to delete driver")
      }
    }
  }

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  if (loading) {
    return <div className="loading">Loading drivers...</div>
  }

  return (
    <div className="drivers-container">
      <div className="drivers-header">
        <div className="header-content">
          <h1>
            <Users className="header-icon" />
            Driver Management
          </h1>
          <p>Manage your drivers and their information</p>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Driver</h2>
              <button onClick={() => setShowForm(false)} className="close-btn">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="driver-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="licenseNumber">License Number</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Enter license number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                  Active Driver
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="drivers-grid">
        {drivers.length > 0 ? (
          drivers.map((driver) => (
            <div key={driver._id} className="driver-card">
              <div className="driver-header">
                <h3>{driver.name}</h3>
                <div className={`driver-status ${driver.isActive ? "active" : "inactive"}`}>
                  {driver.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="driver-content">
                <div className="driver-info">
                  <div className="info-item">
                    <Mail size={16} />
                    <span>{driver.email}</span>
                  </div>
                  <div className="info-item">
                    <Phone size={16} />
                    <span>{driver.phone}</span>
                  </div>
                  {driver.licenseNumber && (
                    <div className="info-item">
                      <CreditCard size={16} />
                      <span>{driver.licenseNumber}</span>
                    </div>
                  )}
                </div>

                <div className="driver-meta">
                  <p>
                    <strong>Joined:</strong> {new Date(driver.createdAt).toLocaleDateString()}
                  </p>
                  {driver.lastLogin && (
                    <p>
                      <strong>Last Login:</strong> {new Date(driver.lastLogin).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="driver-actions">
                <button onClick={() => handleEdit(driver)} className="btn-edit">
                  <Edit size={16} />
                  Edit
                </button>
                <button onClick={() => handleDelete(driver._id)} className="btn-delete">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-drivers">
            <Users size={48} />
            <h3>No drivers found</h3>
            <p>No drivers have been registered yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DriverList
