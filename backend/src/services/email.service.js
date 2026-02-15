const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

class EmailService {
	async sendVerificationEmail(to, name, verificationToken) {
		const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

		await transporter.sendMail({
			from: `"Midas" <${process.env.SMTP_USER}>`,
			to,
			subject: "Verify your Midas account",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<h2 style="color: #333;">Welcome to Midas, ${name}!</h2>
					<p style="color: #555; font-size: 16px;">
						Thank you for creating an account. Please verify your email address to get started.
					</p>
					<div style="text-align: center; margin: 30px 0;">
						<a href="${verificationUrl}"
							 style="background-color: #c9a227; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
							Verify Email Address
						</a>
					</div>
					<p style="color: #888; font-size: 14px;">
						This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
					</p>
					<p style="color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
						If the button doesn't work, copy and paste this link into your browser:<br/>
						<a href="${verificationUrl}" style="color: #c9a227;">${verificationUrl}</a>
					</p>
				</div>
			`,
		});
	}
}

module.exports = new EmailService();
