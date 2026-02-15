import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { verifyEmail } from "../api/auth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const VerifyEmail = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		token ? "loading" : "error",
	);
	const [message, setMessage] = useState(
		token ? "" : "No verification token provided.",
	);

	useEffect(() => {
		if (!token) return;

		verifyEmail(token)
			.then(({ data }) => {
				setStatus("success");
				setMessage(data.message || "Email verified successfully!");
			})
			.catch((err) => {
				setStatus("error");
				setMessage(
					err?.response?.data?.message ||
						"Verification failed. The link may be expired or invalid.",
				);
			});
	}, [token]);

	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4">
			<Card className="w-full max-w-md text-center">
				{status === "loading" && (
					<>
						<Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--accent-primary)]" />
						<p className="mt-4 text-[var(--text-secondary)]">
							Verifying your email...
						</p>
					</>
				)}

				{status === "success" && (
					<>
						<CheckCircle className="mx-auto h-12 w-12 text-green-500" />
						<h2 className="mt-4 text-xl font-bold text-[var(--text)]">
							Email Verified
						</h2>
						<p className="mt-2 text-[var(--text-secondary)]">{message}</p>
						<div className="mt-6 flex justify-center gap-3">
							<Link to="/student/login">
								<Button variant="outline">Student Login</Button>
							</Link>
							<Link to="/merchant/login">
								<Button variant="outline">Merchant Login</Button>
							</Link>
						</div>
					</>
				)}

				{status === "error" && (
					<>
						<XCircle className="mx-auto h-12 w-12 text-red-500" />
						<h2 className="mt-4 text-xl font-bold text-[var(--text)]">
							Verification Failed
						</h2>
						<p className="mt-2 text-[var(--text-secondary)]">{message}</p>
						<Link to="/" className="mt-6 inline-block">
							<Button variant="outline">Back to Home</Button>
						</Link>
					</>
				)}
			</Card>
		</div>
	);
};

export default VerifyEmail;
