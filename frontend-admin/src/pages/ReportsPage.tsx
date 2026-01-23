import { type Report, ReportStatus } from "@shared";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { reportsApi } from "../lib/reports";
import { usersApi } from "../lib/users";
import type { PaginatedResponse } from "../types/admin.types";

export default function ReportsPage() {
	const [page, setPage] = useState(1);
	const [data, setData] = useState<PaginatedResponse<Report> | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchReports = async () => {
			setLoading(true);
			try {
				const res = await reportsApi.getReports(page);
				setData(res);
			} catch (e) {
				console.error(e);
				alert("Failed to fetch reports");
			} finally {
				setLoading(false);
			}
		};
		fetchReports();
	}, [page]);

	const handleResolve = async (id: string) => {
		if (!confirm("Mark as resolved?")) return;
		await reportsApi.updateStatus(id, ReportStatus.RESOLVED);
		// Refresh logic is a bit tricky with local fetchReports,
		// but I can just reload the page or trigger a refresh state.
		// For simplicity, let's reload.
		window.location.reload();
	};

	const handleSuspend = async (userId: string) => {
		if (!confirm("Suspend this user?")) return;
		await usersApi.suspendUser(userId);
		alert("User suspended");
	};

	if (loading && !data) return <div>Loading...</div>;

	return (
		<div className="container mx-auto p-8">
			<h1 className="text-3xl font-bold mb-6">Reports</h1>
			<div className="bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Reason</TableHead>
							<TableHead>Reporter</TableHead>
							<TableHead>Reported User</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data?.data.map((report) => (
							<TableRow key={report.id}>
								<TableCell>{report.reason}</TableCell>
								<TableCell>{report.reporterId}</TableCell>
								<TableCell>{report.reportedUserId}</TableCell>
								<TableCell>{report.status}</TableCell>
								<TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
								<TableCell className="space-x-2">
									{report.status === ReportStatus.PENDING && (
										<Button size="sm" onClick={() => handleResolve(report.id)}>
											Resolve
										</Button>
									)}
									<Button
										size="sm"
										variant="destructive"
										onClick={() => handleSuspend(report.reportedUserId)}
									>
										Suspend User
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<div className="flex justify-between items-center p-4 border-t">
					<div className="text-sm text-gray-600">
						Page {data?.meta.page} of {data?.meta.totalPages}
					</div>
					<div className="space-x-2">
						<Button
							onClick={() => setPage(page - 1)}
							disabled={page === 1}
							variant="outline"
							size="sm"
						>
							Previous
						</Button>
						<Button
							onClick={() => setPage(page + 1)}
							disabled={page >= (data?.meta.totalPages || 1)}
							variant="outline"
							size="sm"
						>
							Next
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
