const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const path = require("path");
require("dotenv").config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());
// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/drivers", require("./routes/drivers"));
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/incidents", require("./routes/incidents"));
app.use("/api/reports", require("./routes/reports"));


app.get("/api/health", (req, res) => {
  res.json({
    message: "Driver Safety API is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
   
    error: err.message
  });
});

app.all("/{*any}", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});
