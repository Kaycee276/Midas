const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { validate } = require('../middleware/validation');
const { verifyToken, requireStudent } = require('../middleware/auth');
const { registrationLimiter, loginLimiter } = require('../middleware/rateLimiter');
const {
  studentRegistrationSchema,
  studentLoginSchema,
  studentUpdateSchema
} = require('../validators/student.validator');

router.post(
  '/register',
  registrationLimiter,
  validate(studentRegistrationSchema),
  studentController.register
);

router.post(
  '/login',
  loginLimiter,
  validate(studentLoginSchema),
  studentController.login
);

router.get(
  '/me',
  verifyToken,
  requireStudent,
  studentController.getMe
);

router.patch(
  '/profile',
  verifyToken,
  requireStudent,
  validate(studentUpdateSchema),
  studentController.updateProfile
);

module.exports = router;
