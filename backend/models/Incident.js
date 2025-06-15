const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Driver ID is required"]
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle ID is required"]
    },
    type: {
      type: String,
      enum: [
        "speeding",
        "harsh_braking",
        "rapid_acceleration",
        "accident",
        "fatigue",
        "distraction",
        "traffic_violation",
        "mechanical_failure",
        "weather_related",
        "other"
      ],
      required: [true, "Incident type is required"]
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: [true, "Severity level is required"]
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot be more than 1000 characters"]
    },
    location: {
      latitude: {
        type: Number,
        required: [true, "Latitude is required"]
      },
      longitude: {
        type: Number,
        required: [true, "Longitude is required"]
      },
      address: {
        type: String,
        trim: true
      }
    },
    vehicleData: {
      speed: {
        type: Number,
        min: [0, "Speed cannot be negative"]
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    resolvedAt: {
      type: Date
    },
    resolution: {
      notes: String,
      actions: [String]
    }
  },
  {
    timestamps: true
  }
);


let Incident;
try {
  Incident = mongoose.model("Incident");
} catch {
  Incident = mongoose.model("Incident", incidentSchema);
}

module.exports = Incident;
