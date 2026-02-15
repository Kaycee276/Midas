const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ValidationError } = require('../utils/errors');
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } = require('../utils/constants');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

const uploadFields = upload.fields([
  { name: 'student_id_document', maxCount: 1 },
  { name: 'national_id_document', maxCount: 1 },
  { name: 'business_registration_document', maxCount: 1 },
  { name: 'proof_of_address_document', maxCount: 1 },
  { name: 'business_photo', maxCount: 1 }
]);

module.exports = {
  upload,
  uploadFields
};
