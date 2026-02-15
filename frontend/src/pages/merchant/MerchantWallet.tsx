import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	Wallet as WalletIcon,
	ArrowUpRight,
	ArrowDownLeft,
	CreditCard,
} from "lucide-react";
import { getMerchantWalletInfo } from "../../api/merchant-wallet";
import type {
	MerchantWalletInfo,
	MerchantWalletTransaction,
} from "../../types";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";

const txnTypeLabel: Record<string, string> = {
	investment_credit: "Investment Received",
	withdrawal: "Withdrawal",
	dividend_debit: "Dividend Paid",
};

const txnBadgeVariant = (
	status: string,
): "success" | "warning" | "error" | "default" => {
	if (status === "completed") return "success";
	if (status === "pending") return "warning";
	if (status === "failed" || status === "reversed") return "error";
	return "default";
};

const isCredit = (type: string) => type === "investment_credit";

const MerchantWallet = () => {
	const [info, setInfo] = useState<MerchantWalletInfo | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetch = async () => {
			try {
				const { data } = await getMerchantWalletInfo();
				setInfo(data.data);
			} catch {
				// ignore
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, []);

	if (loading) return <Spinner size="lg" className="py-20" />;

	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<h1 className="text-2xl font-bold text-[var(--text)]">Wallet</h1>
			<p className="mt-1 text-[var(--text-secondary)]">Manage your funds</p>

			{/* Balance Card */}
			<Card className="mt-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<WalletIcon className="h-10 w-10 text-[var(--accent-primary)]" />
						<div>
							<p className="text-sm text-[var(--text-secondary)]">
								Available Balance
							</p>
							<p className="text-3xl font-bold text-var(--text)">
								{"\u20A6"}
								{info?.balance.toLocaleString()}
							</p>
						</div>
					</div>
					<div className="flex gap-2">
						<Link to="/merchant/wallet/withdraw">
							<Button variant="outline">
								<CreditCard className="h-4 w-4" /> Withdraw
							</Button>
						</Link>
					</div>
				</div>
			</Card>

			{/* Recent Transactions */}
			<div className="mt-8">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-[var(--text)]">
						Recent Transactions
					</h2>
					<span className="text-sm text-[var(--text-tertiary)]">Last 10</span>
				</div>

				{!info?.recent_transactions?.length ? (
					<Card className="mt-4 text-center">
						<p className="text-[var(--text-secondary)]">
							No transactions yet. Transactions will appear here when students
							invest in your business.
						</p>
					</Card>
				) : (
					<div className="mt-4 space-y-3">
						{info.recent_transactions.map((txn: MerchantWalletTransaction) => (
							<Card key={txn.id} className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									{isCredit(txn.type) ? (
										<ArrowDownLeft className="h-5 w-5 text-[var(--success)]" />
									) : (
										<ArrowUpRight className="h-5 w-5 text-[var(--error)]" />
									)}
									<div>
										<p className="font-medium text-[var(--text)]">
											{txnTypeLabel[txn.type] || txn.type}
										</p>
										<p className="text-sm text-[var(--text-tertiary)]">
											{new Date(txn.created_at).toLocaleDateString()}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p
										className={`font-semibold ${isCredit(txn.type) ? "text-[var(--success)]" : "text-[var(--text)]"}`}
									>
										{isCredit(txn.type) ? "+" : "-"}
										{"\u20A6"}
										{parseFloat(String(txn.amount)).toLocaleString()}
									</p>
									<Badge variant={txnBadgeVariant(txn.status)}>
										{txn.status}
									</Badge>
								</div>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default MerchantWallet;
