const fs = require('fs/promises');
const path = require('path');
const { ValidationError } = require('../utils/errors');
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } = require('../utils/constants');

class StorageService {
  constructor() {
    this.uploadDir = path.resolve(__dirname, '../../uploads/kyc-documents');
  }

  async uploadFile(file, merchantId, documentType) {
    if (!file) {
      throw new ValidationError('No file provided');
    }

    this.validateFile(file);

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const relativePath = `${merchantId}/${documentType}/${Date.now()}_${safeName}`;
    const fullPath = path.join(this.uploadDir, relativePath);

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file.buffer);

    return relativePath;
  }

  async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.unlink(fullPath);
    } catch {
      // Ignore if file doesn't exist on disk
    }
  }

  async getSignedUrl(filePath, _expiresIn = 3600) {
    if (!filePath) return null;
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    return `${baseUrl}/api/documents/${filePath}`;
  }

  validateFile(file) {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new ValidationError(
        `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(
        `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }
  }
}

module.exports = new StorageService();
