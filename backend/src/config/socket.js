const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io;

function initSocket(httpServer) {
	const allowedOrigins = process.env.ALLOWED_ORIGINS
		? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
		: [];

	io = new Server(httpServer, {
		cors: {
			origin: (origin, callback) => {
				if (!origin || allowedOrigins.includes(origin)) {
					callback(null, true);
				} else {
					callback(new Error('Not allowed by CORS'));
				}
			},
			credentials: true,
		},
	});

	io.on('connection', (socket) => {
		logger.info(`Socket connected: ${socket.id}`);

		socket.on('disconnect', () => {
			logger.info(`Socket disconnected: ${socket.id}`);
		});
	});

	return io;
}

function getIO() {
	if (!io) {
		throw new Error('Socket.IO not initialized');
	}
	return io;
}

function emitDashboardUpdate() {
	try {
		const socketIO = getIO();
		socketIO.emit('dashboard:updated');
	} catch {
		// Socket not initialized yet, skip
	}
}

module.exports = { initSocket, getIO, emitDashboardUpdate };
