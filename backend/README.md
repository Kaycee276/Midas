# Midas Merchant Registration & KYC Backend

A comprehensive merchant registration and KYC (Know Your Customer) verification system for the Midas student investment platform.

## Features

- ✅ Merchant registration with business details
- ✅ JWT-based authentication
- ✅ KYC document submission (single-step upload)
- ✅ Admin KYC review and approval system
- ✅ File upload to Supabase Storage
- ✅ Rate limiting and security features
- ✅ Comprehensive error handling and logging
- ✅ Input validation with Joi

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Authentication**: JWT
- **Validation**: Joi
- **File Upload**: Multer
- **Logging**: Winston

## Project Structure

```
backend/
├── src/
│   ├── config/          # App and Supabase configuration
│   ├── middleware/      # Auth, validation, error handling, upload
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Database access layer
│   ├── routes/          # API routes
│   ├── validators/      # Joi schemas
│   ├── utils/           # Helpers and utilities
│   └── types/           # TypeScript-like enums
├── database/            # SQL schema and migrations
├── uploads/             # Temporary file storage
├── logs/                # Application logs
└── server.js            # Entry point
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### 2. Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Database Setup

#### Step 1: Run SQL Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `database/schema.sql`
4. Execute the script

This will create:
- `merchants` table
- `merchant_kyc` table
- `admins` table
- `kyc_submission_history` table
- All necessary triggers and indexes
- A test admin account (admin@midas.com / Admin@123)

#### Step 2: Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Create a new bucket named `kyc-documents`
3. Set it to **Private**
4. Configure the bucket policies if needed

### 5. Run the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000`

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Health Check
- `GET /health` - Server health status

#### Merchant Authentication

- `POST /api/auth/register` - Register new merchant
  ```json
  {
    "email": "merchant@example.com",
    "password": "SecurePass@123",
    "business_name": "Campus Cafe",
    "business_type": "cafe",
    "business_description": "Coffee shop near campus",
    "business_address": "123 Campus Road",
    "business_phone": "+1234567890",
    "owner_full_name": "John Doe",
    "owner_phone": "+1234567890",
    "owner_email": "john@example.com",
    "proximity_to_campus": "on_campus",
    "terms_accepted": true
  }
  ```

- `POST /api/auth/login` - Merchant login
  ```json
  {
    "email": "merchant@example.com",
    "password": "SecurePass@123"
  }
  ```

- `GET /api/auth/me` - Get current merchant profile (protected)

- `PATCH /api/auth/profile` - Update merchant profile (protected)

#### KYC Management

- `POST /api/kyc/submit` - Submit KYC documents (protected, multipart/form-data)
  - Form fields:
    - `student_id_number` (optional)
    - `national_id_number` (required if no student ID)
    - `business_registration_number` (optional)
    - `tax_identification_number` (optional)
    - `years_in_operation` (optional)
    - `average_monthly_revenue` (optional)
  - File fields (all optional):
    - `student_id_document`
    - `national_id_document`
    - `business_registration_document`
    - `proof_of_address_document`
    - `business_photo`

- `GET /api/kyc/status` - Get KYC status and documents (protected)

- `GET /api/kyc/documents/:type` - Get specific document URL (protected)

- `DELETE /api/kyc/document/:type` - Delete specific document (protected)

#### Admin Operations

- `POST /api/admin/login` - Admin login
  ```json
  {
    "email": "admin@midas.com",
    "password": "Admin@123"
  }
  ```

- `GET /api/admin/kyc/pending?page=1&limit=20` - List pending KYC submissions (protected)

- `GET /api/admin/kyc/:id` - Get KYC details with documents (protected)

- `POST /api/admin/kyc/:id/approve` - Approve KYC (protected)
  ```json
  {
    "admin_notes": "All documents verified"
  }
  ```

- `POST /api/admin/kyc/:id/reject` - Reject or request resubmission (protected)
  ```json
  {
    "status": "rejected",
    "rejection_reason": "Invalid business registration",
    "admin_notes": "Please provide valid registration document"
  }
  ```

### Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## File Upload Requirements

- **Allowed types**: JPEG, PNG, PDF
- **Max size**: 5MB per file
- **Storage**: Supabase Storage (private bucket)
- **Path structure**: `{merchant_id}/{document_type}/{filename}`

## Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT token authentication
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation and sanitization
- ✅ SQL injection protection (parameterized queries)
- ✅ File type and size validation

## Rate Limits

- **Registration**: 5 attempts per hour per IP
- **Login**: 10 attempts per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per user

## Logging

Logs are stored in the `logs/` directory:

- `error.log` - Error logs only
- `combined.log` - All logs

## Database Schema

### Merchants Table
- Business and owner information
- Account and KYC status tracking
- Terms acceptance

### Merchant KYC Table
- Identity documents (optional student ID)
- Business documents
- Document URLs in Supabase Storage
- Review status and admin notes

### Admins Table
- Admin user accounts
- Role-based access

### KYC Submission History
- Audit trail of all KYC submissions
- Historical data for compliance

## Default Admin Account

**Email**: admin@midas.com
**Password**: Admin@123

⚠️ **Important**: Change this password immediately in production!

## Testing with Postman/Thunder Client

1. Register a merchant via `POST /api/auth/register`
2. Login to get JWT token
3. Submit KYC with documents via `POST /api/kyc/submit`
4. Login as admin
5. Review pending KYC via `GET /api/admin/kyc/pending`
6. Approve/reject via admin endpoints

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a strong `JWT_SECRET` (min 32 characters)
3. Configure proper CORS origins
4. Set up proper Supabase RLS policies
5. Change default admin password
6. Set up log rotation
7. Use process manager (PM2, systemd)
8. Set up monitoring and alerting

## Troubleshooting

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check if tables were created successfully
- Ensure service role key is used (not anon key)

### File Upload Issues
- Verify Supabase Storage bucket exists and is named `kyc-documents`
- Check bucket is set to private
- Ensure sufficient storage quota

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration time
- Ensure Authorization header format: `Bearer <token>`

## License

Proprietary - Midas Platform

## Support

For issues and questions, contact the development team.
