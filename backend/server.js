require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const connectDB = require('./db');

const datasetsRouter  = require('./routes/datasets');
const blogsRouter     = require('./routes/blogs');
const usersRouter     = require('./routes/users');
const eventsRouter    = require('./routes/events');
const feedbackRouter  = require('./routes/feedback');
const suggestRouter   = require('./routes/suggestions');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Connect MongoDB ───────────────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/datasets',    datasetsRouter);
app.use('/api/blogs',       blogsRouter);
app.use('/api/users',       usersRouter);
app.use('/api/events',      eventsRouter);
app.use('/api/feedback',    feedbackRouter);
app.use('/api/suggestions', suggestRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GeoDiscovery API is running' });
});

// ── Catch-all → serve index.html (FIXED) ─────────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🌍 GeoDiscovery server running at http://localhost:${PORT}\n`);
});




// const express = require("express");
// const cors = require("cors");
// const path = require("path");

// const app = express();
// const PORT = 3000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Serve frontend files
// app.use(express.static(path.join(__dirname, "public")));

// // Import routes
// const datasetRoutes = require("./routes/datasets");

// // API routes
// app.use("/api/datasets", datasetRoutes);

// // Test route
// app.get("/api", (req, res) => {
//   res.json({ message: "GeoDiscovery API running 🚀" });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });