const jwt = require("jsonwebtoken");
const merchantService = require("../services/merchant.service");
const studentService = require("../services/student.service");
const emailService = require("../services/email.service");
const merchantModel = require("../models/merchant.model");
const studentModel = require("../models/student.model");
const { successResponse } = require("../utils/responseFormatter");
const {
	AuthenticationError,
	NotFoundError,
	ValidationError,
} = require("../utils/errors");

class AuthController {
	async register(req, res, next) {
		try {
			const result = await merchantService.register(req.validatedData);
			successResponse(res, result, "Merchant registered successfully", 201);
		} catch (error) {
			next(error);
		}
	}

	async login(req, res, next) {
		try {
			const { email, password } = req.validatedData;
			const result = await merchantService.login(email, password);
			successResponse(res, result, "Login successful");
		} catch (error) {
			next(error);
		}
	}

	async getMe(req, res, next) {
		try {
			const merchant = await merchantService.getProfile(req.user.id);
			successResponse(res, { merchant }, "Profile retrieved successfully");
		} catch (error) {
			next(error);
		}
	}

	async updateProfile(req, res, next) {
		try {
			const merchant = await merchantService.updateProfile(
				req.user.id,
				req.validatedData,
			);
			successResponse(res, { merchant }, "Profile updated successfully");
		} catch (error) {
			next(error);
		}
	}

	async verifyEmail(req, res, next) {
		try {
			const { token } = req.query;
			if (!token) {
				throw new ValidationError("Verification token is required");
			}

			let decoded;
			try {
				decoded = jwt.verify(token, process.env.JWT_SECRET);
			} catch {
				throw new AuthenticationError("Invalid or expired verification token");
			}

			if (decoded.type !== "email_verify") {
				throw new AuthenticationError("Invalid verification token");
			}

			const model =
				decoded.userType === "merchant" ? merchantModel : studentModel;
			const user = await model.findById(decoded.id);

			if (!user) {
				throw new NotFoundError("Account not found");
			}

			if (user.is_verified) {
				return successResponse(res, null, "Email already verified");
			}

			await model.update(decoded.id, { is_verified: true });

			successResponse(res, null, "Email verified successfully");
		} catch (error) {
			next(error);
		}
	}

	async resendVerification(req, res, next) {
		try {
			const { email, type } = req.body;

			if (!email || !type) {
				throw new ValidationError("Email and type are required");
			}

			if (!["merchant", "student"].includes(type)) {
				throw new ValidationError("Type must be merchant or student");
			}

			const model = type === "merchant" ? merchantModel : studentModel;
			const user = await model.findByEmail(email);

			if (!user) {
				throw new NotFoundError("Account not found");
			}

			if (user.is_verified) {
				return successResponse(res, null, "Email is already verified");
			}

			const service = type === "merchant" ? merchantService : studentService;
			const verificationToken = service.generateVerificationToken(user.id);
			const name =
				type === "merchant"
					? user.owner_full_name || user.business_name
					: user.full_name;
			await emailService.sendVerificationEmail(
				user.email,
				name,
				verificationToken,
			);

			successResponse(
				res,
				null,
				"Verification email sent, check your spam folder if you do not see it in your inbox",
			);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = new AuthController();
