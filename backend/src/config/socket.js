const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io;

function initSocket(httpServer) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join authenticated user's private notification room
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        logger.info(`Socket ${socket.id} joined notification room user:${userId}`);
      }
    });

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

function emitPaymentNotification(studentId, paymentData) {
  try {
    const socketIO = getIO();
    const payload = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'payment',
      title: 'Payment Confirmed',
      message: `Your wallet deposit of ₦${Number(paymentData.amount).toLocaleString()} was confirmed successfully.`,
      amount: Number(paymentData.amount),
      balance: Number(paymentData.balance),
      transactionId: paymentData.transactionId,
      timestamp: new Date().toISOString(),
    };
    socketIO.to(`user:${studentId}`).emit('notification:new', payload);
    socketIO.to(`user:${studentId}`).emit('payment:succeeded', payload);
    socketIO.emit('dashboard:updated');
  } catch {
    // Socket not initialized yet, skip
  }
}

function emitInvestmentNotification(merchantId, studentId, investmentData) {
  try {
    const socketIO = getIO();
    const merchantPayload = {
      id: `notif-${Date.now()}-m`,
      type: 'investment',
      title: 'New Investment Received',
      message: `Received micro-capital investment of ₦${Number(investmentData.amount).toLocaleString()} (${investmentData.shares} shares) from ${investmentData.investorName}.`,
      amount: Number(investmentData.amount),
      shares: Number(investmentData.shares),
      timestamp: new Date().toISOString(),
    };
    const studentPayload = {
      id: `notif-${Date.now()}-s`,
      type: 'investment',
      title: 'Investment Confirmed',
      message: `You backed ${investmentData.businessName} with ₦${Number(investmentData.amount).toLocaleString()} (${investmentData.shares} shares).`,
      amount: Number(investmentData.amount),
      shares: Number(investmentData.shares),
      timestamp: new Date().toISOString(),
    };
    socketIO.to(`user:${merchantId}`).emit('notification:new', merchantPayload);
    socketIO.to(`user:${studentId}`).emit('notification:new', studentPayload);
    socketIO.emit('dashboard:updated');
  } catch {
    // Socket not initialized yet, skip
  }
}

function emitDividendNotification(studentId, dividendData) {
  try {
    const socketIO = getIO();
    const payload = {
      id: `notif-${Date.now()}-d`,
      type: 'dividend',
      title: 'Annual Dividend Credited',
      message: `Annual profit distribution of ₦${Number(dividendData.amount).toLocaleString()} from ${dividendData.merchantName} deposited into your wallet.`,
      amount: Number(dividendData.amount),
      timestamp: new Date().toISOString(),
    };
    socketIO.to(`user:${studentId}`).emit('notification:new', payload);
    socketIO.emit('dashboard:updated');
  } catch {
    // Socket not initialized yet, skip
  }
}

function emitKycStatusNotification(merchantId, kycData) {
  try {
    const socketIO = getIO();
    const isApproved = kycData.status === 'approved';
    const payload = {
      id: `notif-${Date.now()}-k`,
      type: 'kyc',
      title: isApproved ? 'KYC Verification Approved' : 'KYC Status Update',
      message: isApproved
        ? 'Congratulations! Your campus business has been verified and is now live for student investment.'
        : `Your KYC status has been updated to: ${kycData.status}.`,
      status: kycData.status,
      timestamp: new Date().toISOString(),
    };
    socketIO.to(`user:${merchantId}`).emit('notification:new', payload);
    socketIO.emit('dashboard:updated');
  } catch {
    // Socket not initialized yet, skip
  }
}

module.exports = {
  initSocket,
  getIO,
  emitDashboardUpdate,
  emitPaymentNotification,
  emitInvestmentNotification,
  emitDividendNotification,
  emitKycStatusNotification,
};
