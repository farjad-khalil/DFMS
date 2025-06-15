const express = require("express");
const { body, validationResult } = require("express-validator");
const Incident = require("../models/Incident");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

// @route   POST /api/incidents/admin
// @desc    Admin/Manager creates a new incident (can specify driverId)
// @access  Private (Admin/Manager only)
router.post(
  "/admin",
  [
    auth,
    authorize("admin", "manager"),
    [
      body("vehicleId").notEmpty().withMessage("Vehicle ID is required"),
      body("driverId").notEmpty().withMessage("Driver ID is required"),
      body("type").notEmpty().withMessage("Incident type is required"),
      body("severity").notEmpty().withMessage("Severity is required"),
      body("description").notEmpty().withMessage("Description is required"),
      body("location.latitude").isNumeric().withMessage("Valid latitude is required"),
      body("location.longitude").isNumeric().withMessage("Valid longitude is required")
    ]
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const incident = await Incident.create({
        ...req.body
      });

      await incident.populate(["driverId", "vehicleId"]);

      res.status(201).json({
        success: true,
        incident
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   POST /api/incidents
// @desc    Create new incident
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("vehicleId").notEmpty().withMessage("Vehicle ID is required"),
      body("type").notEmpty().withMessage("Incident type is required"),
      body("severity").notEmpty().withMessage("Severity is required"),
      body("description").notEmpty().withMessage("Description is required"),
      body("location.latitude").isNumeric().withMessage("Valid latitude is required"),
      body("location.longitude").isNumeric().withMessage("Valid longitude is required")
    ]
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const incident = await Incident.create({
        ...req.body,
        driverId: req.user.id
      });

      await incident.populate(["driverId", "vehicleId"]);

      res.status(201).json({
        success: true,
        incident
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   GET /api/incidents
// @desc    Get all incidents
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const query = {};

    // If driver, only show their incidents
    if (req.user.role === "driver") {
      query.driverId = req.user.id;
    }

    const incidents = await Incident.find(query)
      .populate("driverId", "name email")
      .populate("vehicleId", "vehicleNumber make model")
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      count: incidents.length,
      incidents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/incidents/:id/resolve
// @desc    Resolve incident
// @access  Private (Admin/Manager only)
router.put("/:id/resolve", [auth, authorize("admin", "manager")], async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        resolved: true,
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
        "resolution.notes": req.body.notes
      },
      { new: true }
    ).populate(["driverId", "vehicleId", "resolvedBy"]);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json({
      success: true,
      incident
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
