// ExpressJS.Auth.Pg.API - MRC (Model Route Controller)
const express = require("express");
const app = express();
const sequelize = require('./config/database');
const port = process.env.PORT;
const cors = require('cors');

// Routes
const authRoutes = require("./routes/auth");

// Adds middleware that parses incoming requests with JSON payloads
app.use(express.json());

// Configure CORS
// app.use(cors());
app.use(cors({
    origin: 'http://localhost:4200', // Frontend URL
    credentials: true
}));

// Declare api category endpoints
app.use("/api/auth", authRoutes);

app.listen(port, () => console.log('# ExpressJS.Auth.Pg.API Server running on port:', port));
