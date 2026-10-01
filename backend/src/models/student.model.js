const prisma = require('../config/prisma');

class StudentModel {
  async create(studentData) {
    return prisma.student.create({
      data: studentData,
    });
  }

  async findById(id) {
    return prisma.student.findUnique({
      where: { id },
    });
  }

  async findByEmail(email) {
    return prisma.student.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findByStudentId(studentId) {
    return prisma.student.findFirst({
      where: { student_id: studentId },
    });
  }

  async update(id, updates) {
    return prisma.student.update({
      where: { id },
      data: updates,
    });
  }

  async updateLastLogin(id) {
    return prisma.student.update({
      where: { id },
      data: { last_login: new Date() },
    });
  }
}

module.exports = new StudentModel();
