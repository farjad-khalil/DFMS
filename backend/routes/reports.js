const express = require("express");
const Incident = require("../models/Incident");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

// @route   GET /api/reports/incidents-by-type
// @desc    Get incident distribution by type
// @access  Private (Admin/Manager only)
router.get("/incidents-by-type", [auth, authorize("admin", "manager")], async (req, res) => {
  try {
    const data = await Incident.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error getting incidents by type:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/reports/incidents-by-severity
// @desc    Get incident distribution by severity
// @access  Private (Admin/Manager only)
router.get("/incidents-by-severity", [auth, authorize("admin", "manager")], async (req, res) => {
  try {
    const data = await Incident.aggregate([
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error getting incidents by severity:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/reports/monthly-incidents
// @desc    Get monthly incident trends for the past 12 months
// @access  Private (Admin/Manager only)
router.get("/monthly-incidents", [auth, authorize("admin", "manager")], async (req, res) => {
  try {
    const data = await Incident.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error getting monthly incidents:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/reports/driver-performance
// @desc    Get performance metrics for all drivers
// @access  Private (Admin/Manager only)
router.get("/driver-performance", [auth, authorize("admin", "manager")], async (req, res) => {
  try {
    const data = await User.aggregate([
      {
        $match: { role: "driver" }
      },
      {
        $lookup: {
          from: "incidents",
          localField: "_id",
          foreignField: "driverId",
          as: "incidents"
        }
      },
      {
        $project: {
          _id: 1,
          driverName: "$name",
          driverEmail: "$email",
          totalIncidents: { $size: "$incidents" },
          criticalIncidents: {
            $size: {
              $filter: {
                input: "$incidents",
                as: "incident",
                cond: { $eq: ["$$incident.severity", "critical"] }
              }
            }
          },
          resolvedIncidents: {
            $size: {
              $filter: {
                input: "$incidents",
                as: "incident",
                cond: { $eq: ["$$incident.resolved", true] }
              }
            }
          }
        }
      },
      {
        $sort: { totalIncidents: -1 }
      }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error getting driver performance:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/reports/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin/Manager only)
router.get("/dashboard", [auth, authorize("admin", "manager")], async (req, res) => {
  try {
    const [totalDrivers, totalVehicles, totalIncidents, activeIncidents, resolvedIncidents, criticalIncidents] = await Promise.all([
      User.countDocuments({ role: "driver" }),
      Vehicle.countDocuments(),
      Incident.countDocuments(),
      Incident.countDocuments({ resolved: false }),
      Incident.countDocuments({ resolved: true }),
      Incident.countDocuments({ severity: "critical" })
    ]);

    res.json({
      success: true,
      stats: {
        totalDrivers,
        totalVehicles,
        totalIncidents,
        activeIncidents,
        resolvedIncidents,
        criticalIncidents
      }
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;