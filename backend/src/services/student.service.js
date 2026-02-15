const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const studentModel = require('../models/student.model');
const emailService = require('./email.service');
const { ConflictError, AuthenticationError, NotFoundError } = require('../utils/errors');

class StudentService {
  async register(studentData) {
    // Check for duplicate email
    const existingStudent = await studentModel.findByEmail(studentData.email);
    if (existingStudent) {
      throw new ConflictError('Email already registered');
    }

    // Check for duplicate student ID if provided
    if (studentData.student_id) {
      const existingStudentId = await studentModel.findByStudentId(studentData.student_id);
      if (existingStudentId) {
        throw new ConflictError('Student ID already registered');
      }
    }

    const passwordHash = await bcrypt.hash(studentData.password, 12);

    const student = await studentModel.create({
      email: studentData.email.toLowerCase(),
      password_hash: passwordHash,
      full_name: studentData.full_name,
      student_id: studentData.student_id,
      phone: studentData.phone,
      university: studentData.university,
      program: studentData.program,
      year_of_study: studentData.year_of_study,
      account_status: 'active',
      is_verified: false,
      terms_accepted: studentData.terms_accepted,
      terms_accepted_at: new Date().toISOString()
    });

    try {
      const verificationToken = this.generateVerificationToken(student.id);
      await emailService.sendVerificationEmail(
        student.email,
        studentData.full_name,
        verificationToken
      );
    } catch (err) {
      console.error('Verification email failed (student created):', err.message);
    }

    const { password_hash, ...studentWithoutPassword } = student;

    return {
      student: studentWithoutPassword,
      message: 'Registration successful. Please check your email to verify your account.'
    };
  }

  async login(email, password) {
    const student = await studentModel.findByEmail(email);
    if (!student) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (student.account_status === 'suspended') {
      throw new AuthenticationError('Account is suspended');
    }

    const isPasswordValid = await bcrypt.compare(password, student.password_hash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (student.is_verified === false) {
      throw new AuthenticationError('Please verify your email before logging in');
    }

    await studentModel.updateLastLogin(student.id);

    const token = this.generateToken(student.id, 'student');

    const { password_hash, ...studentWithoutPassword } = student;

    return {
      student: studentWithoutPassword,
      token
    };
  }

  async getProfile(studentId) {
    const student = await studentModel.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const { password_hash, ...studentWithoutPassword } = student;
    return studentWithoutPassword;
  }

  async updateProfile(studentId, updates) {
    const student = await studentModel.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const updatedStudent = await studentModel.update(studentId, updates);

    const { password_hash, ...studentWithoutPassword } = updatedStudent;
    return studentWithoutPassword;
  }

  generateToken(userId, type) {
    return jwt.sign(
      { id: userId, type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  generateVerificationToken(userId) {
    return jwt.sign(
      { id: userId, type: 'email_verify', userType: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}

module.exports = new StudentService();
