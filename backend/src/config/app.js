const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("../routes");
const errorHandler = require("../middleware/errorHandler");
const { generalLimiter } = require("../middleware/rateLimiter");
const logger = require("../utils/logger");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS;

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	}),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
app.use(generalLimiter);

// Request logging
app.use((req, res, next) => {
	logger.info(`${req.method} ${req.path}`, {
		ip: req.ip,
		userAgent: req.get("user-agent"),
	});
	next();
});

// Health check endpoint (before API routes for easy access)
app.get("/health", (req, res) => {
	res.json({
		success: true,
		message: "Server is healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: process.env.NODE_ENV || "development",
	});
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
