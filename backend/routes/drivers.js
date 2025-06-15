const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();


// @route   GET /api/drivers
// @desc    Get all drivers
// @access  Private (Admin/Manager only)
router.get("/", [auth, authorize("admin", "manager")], async (req, res) => {
  try {
    const drivers = await User.find({ role: "driver" }).select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      count: drivers.length,
      drivers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/drivers/:id
// @desc    Get single driver
// @access  Private (Admin/Manager only)
router.get("/:id", [auth, authorize("admin", "manager")], async (req, res) => {
  try {
    const driver = await User.findById(req.params.id).select("-password");

    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json({
      success: true,
      driver
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/drivers/:id
// @desc    Update driver
// @access  Private (Admin/Manager only)
router.put("/:id", [auth, authorize("admin", "manager")], async (req, res) => {
  try {
    const { name, email, phone, licenseNumber, isActive } = req.body;

    const driver = await User.findById(req.params.id);

    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Update fields
    if (name) driver.name = name;
    if (email) driver.email = email;
    if (phone) driver.phone = phone;
    if (licenseNumber) driver.licenseNumber = licenseNumber;
    if (typeof isActive !== "undefined") driver.isActive = isActive;

    await driver.save();

    res.json({
      success: true,
      driver
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/drivers/:id
// @desc    Delete driver
// @access  Private (Admin only)
router.delete("/:id", [auth, authorize("admin")], async (req, res) => {
  try {
    const driver = await User.findById(req.params.id);

    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ message: "Driver not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Driver deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
