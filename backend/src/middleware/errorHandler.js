const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseFormatter');

const errorHandler = (err, req, res, _next) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  errorResponse(res, message, err.errors || null, statusCode);
};

module.exports = errorHandler;
