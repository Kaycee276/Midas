const fs = require('fs').promises;
const path = require('path');
const supabase = require('../config/supabase');
const { ValidationError } = require('../utils/errors');
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } = require('../utils/constants');

class StorageService {
  constructor() {
    this.bucketName = 'kyc-documents';
  }

  async uploadFile(file, merchantId, documentType) {
    try {
      if (!file) {
        throw new ValidationError('No file provided');
      }

      this.validateFile(file);

      const fileBuffer = await fs.readFile(file.path);
      const fileName = `${merchantId}/${documentType}/${Date.now()}_${file.originalname}`;

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (error) throw error;

      // Clean up temporary file
      await fs.unlink(file.path).catch(() => {});

      return data.path;
    } catch (error) {
      // Clean up temporary file on error
      if (file?.path) {
        await fs.unlink(file.path).catch(() => {});
      }
      throw error;
    }
  }

  async deleteFile(filePath) {
    if (!filePath) return;

    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) throw error;
  }

  async getSignedUrl(filePath, expiresIn = 3600) {
    if (!filePath) return null;

    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
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

  async cleanupTempFiles(files) {
    if (!files) return;

    const fileArray = Object.values(files).flat();
    for (const file of fileArray) {
      if (file.path) {
        await fs.unlink(file.path).catch(() => {});
      }
    }
  }
}

module.exports = new StorageService();
