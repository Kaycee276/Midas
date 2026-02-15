const BUSINESS_TYPES = [
  'restaurant',
  'cafe',
  'food_truck',
  'retail',
  'bookstore',
  'laundry',
  'salon',
  'gym',
  'tutoring',
  'printing',
  'electronics',
  'clothing',
  'other'
];

const PROXIMITY_OPTIONS = [
  'on_campus',
  'within_1km',
  'within_2km',
  'within_5km',
  'more_than_5km'
];

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

module.exports = {
  BUSINESS_TYPES,
  PROXIMITY_OPTIONS,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
};
