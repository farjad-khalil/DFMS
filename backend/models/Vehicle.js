const mongoose = require("mongoose")

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, "Please provide vehicle number"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    make: {
      type: String,
      required: [true, "Please provide vehicle make"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Please provide vehicle model"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Please provide manufacturing year"],
      min: [1900, "Year must be after 1900"],
      max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "maintenance", "inactive", "retired"],
      default: "active",
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid", "cng"],
      required: [true, "Please provide fuel type"],
    },
    specifications: {
      color: String,
      transmission: {
        type: String,
        enum: ["manual", "automatic", "cvt"],
      },
      seatingCapacity: Number,
      mileage: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Vehicle", vehicleSchema)
