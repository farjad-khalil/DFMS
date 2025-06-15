const express = require("express")
const { body, validationResult } = require("express-validator")
const Vehicle = require("../models/Vehicle")
const auth = require("../middleware/auth")
const authorize = require("../middleware/authorize")

const router = express.Router()

// @route   POST /api/vehicles
// @desc    Create new vehicle
// @access  Private (Admin/Manager only)
router.post(
  "/",
  [
    auth,
    authorize("admin", "manager"),
    [
      body("vehicleNumber").notEmpty().withMessage("Vehicle number is required"),
      body("make").notEmpty().withMessage("Vehicle make is required"),
      body("model").notEmpty().withMessage("Vehicle model is required"),
      body("year").isNumeric().withMessage("Valid year is required"),
      body("fuelType").notEmpty().withMessage("Fuel type is required"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const vehicle = await Vehicle.create(req.body)

      res.status(201).json({
        success: true,
        vehicle,
      })
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Vehicle number already exists" })
      }
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   GET /api/vehicles
// @desc    Get all vehicles
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("driverId", "name email").sort({ createdAt: -1 })

    res.json({
      success: true,
      count: vehicles.length,
      vehicles,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("driverId", "name email")

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" })
    }

    res.json({
      success: true,
      vehicle,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle
// @access  Private (Admin/Manager only)
router.put("/:id", [auth, authorize("admin", "manager")], async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("driverId", "name email")

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" })
    }

    res.json({
      success: true,
      vehicle,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle
// @access  Private (Admin only)
router.delete("/:id", [auth, authorize("admin")], async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id)

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" })
    }

    res.json({
      success: true,
      message: "Vehicle deleted successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
