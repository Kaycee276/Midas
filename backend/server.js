require("dotenv").config();
const http = require("http");
const app = require("./src/config/app");
const { initSocket } = require("./src/config/socket");
const logger = require("./src/utils/logger");
const { startDividendDistributionJob } = require("./src/jobs/dividend-distribution.job");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
	logger.info(`Server running on port ${PORT}`);
	console.log(`Server is listening at http://localhost:${PORT}`);

	// Start scheduled jobs
	startDividendDistributionJob();
});

// Graceful shutdown
process.on("SIGTERM", () => {
	logger.info("SIGTERM received, shutting down gracefully");
	server.close(() => {
		logger.info("Server closed");
		process.exit(0);
	});
});

process.on("SIGINT", () => {
	logger.info("SIGINT received, shutting down gracefully");
	server.close(() => {
		logger.info("Server closed");
		process.exit(0);
	});
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
	logger.error("Unhandled Rejection:", err);
	server.close(() => {
		process.exit(1);
	});
});

process.on("uncaughtException", (err) => {
	logger.error("Uncaught Exception:", err);
	server.close(() => {
		process.exit(1);
	});
});
