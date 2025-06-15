"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { BarChart3, Download } from "lucide-react"
import "./Reports.css"

const Reports = () => {
  const [incidentsByType, setIncidentsByType] = useState([])
  const [incidentsBySeverity, setIncidentsBySeverity] = useState([])
  const [monthlyIncidents, setMonthlyIncidents] = useState([])
  const [driverPerformance, setDriverPerformance] = useState([])
  const [loading, setLoading] = useState(true)

  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"]

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      const [typeRes, severityRes, monthlyRes, performanceRes] = await Promise.all([
        axios.get("/api/reports/incidents-by-type"),
        axios.get("/api/reports/incidents-by-severity"),
        axios.get("/api/reports/monthly-incidents"),
        axios.get("/api/reports/driver-performance"),
      ])

      setIncidentsByType(typeRes.data.data)
      setIncidentsBySeverity(severityRes.data.data)
      setMonthlyIncidents(monthlyRes.data.data)
      setDriverPerformance(performanceRes.data.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching reports data:", error)
      setLoading(false)
    }
  }

  const exportToCSV = (data, filename) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(data[0]).join(",") +
      "\n" +
      data.map((row) => Object.values(row).join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <div className="loading">Loading reports...</div>
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="header-content">
          <h1>
            <BarChart3 className="header-icon" />
            Safety Reports & Analytics
          </h1>
          <p>Comprehensive insights into driver safety and incident patterns</p>
        </div>
        <button onClick={() => exportToCSV(driverPerformance, "driver-performance")} className="btn-primary">
          <Download size={20} />
          Export Data
        </button>
      </div>

      <div className="reports-grid">
        {/* Incidents by Type */}
        <div className="report-card">
          <div className="card-header">
            <h3>Incidents by Type</h3>
            <p>Distribution of incident types across the fleet</p>
          </div>
          <div className="chart-container">
            <BarChart width={400} height={300} data={incidentsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </div>
        </div>

        {/* Incidents by Severity */}
        <div className="report-card">
          <div className="card-header">
            <h3>Incidents by Severity</h3>
            <p>Severity distribution of reported incidents</p>
          </div>
          <div className="chart-container">
            <PieChart width={400} height={300}>
              <Pie
                data={incidentsBySeverity}
                cx={200}
                cy={150}
                labelLine={false}
                label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {incidentsBySeverity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        {/* Monthly Incidents Trend */}
        <div className="report-card full-width">
          <div className="card-header">
            <h3>Monthly Incidents Trend</h3>
            <p>Incident frequency over the past 12 months</p>
          </div>
          <div className="chart-container">
            <LineChart width={800} height={300} data={monthlyIncidents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={({ _id }) => `${_id.month}/${_id.year}`} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </div>
        </div>

        {/* Driver Performance */}
        <div className="report-card full-width">
          <div className="card-header">
            <h3>Driver Performance Overview</h3>
            <p>Individual driver safety metrics and incident history</p>
          </div>
          <div className="performance-table">
            <table>
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Email</th>
                  <th>Total Incidents</th>
                  <th>Critical Incidents</th>
                  <th>Resolved Incidents</th>
                  <th>Safety Score</th>
                </tr>
              </thead>
              <tbody>
                {driverPerformance.map((driver) => {
                  const safetyScore = Math.max(0, 100 - driver.totalIncidents * 5 - driver.criticalIncidents * 15)
                  return (
                    <tr key={driver._id}>
                      <td>{driver.driverName}</td>
                      <td>{driver.driverEmail}</td>
                      <td>{driver.totalIncidents}</td>
                      <td className="critical">{driver.criticalIncidents}</td>
                      <td className="resolved">{driver.resolvedIncidents}</td>
                      <td>
                        <div
                          className={`safety-score ${safetyScore >= 80 ? "good" : safetyScore >= 60 ? "average" : "poor"}`}
                        >
                          {safetyScore}%
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
