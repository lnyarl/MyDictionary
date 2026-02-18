import { type Report, ReportStatus } from "@stashy/shared";
import type { ReportDetailDto } from "@stashy/shared/dto/report/report.dto";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
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
	const [selectedReport, setSelectedReport] = useState<ReportDetailDto | null>(
		null,
	);
	const [dialogOpen, setDialogOpen] = useState(false);

	const fetchReports = useCallback(async () => {
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
	}, [page]);

	useEffect(() => {
		fetchReports();
	}, [fetchReports]);

	const handleViewDetails = async (id: string) => {
		try {
			const report = await reportsApi.getReport(id);
			setSelectedReport(report);
			setDialogOpen(true);
		} catch (e) {
			console.error(e);
			alert("Failed to fetch report details");
		}
	};

	const handleUpdateStatus = async (status: ReportStatus) => {
		if (!selectedReport) return;
		try {
			await reportsApi.updateStatus(selectedReport.id, status);
			setDialogOpen(false);
			fetchReports(); // Refresh list
		} catch (e) {
			console.error(e);
			alert("Failed to update status");
		}
	};

	const handleSuspend = async () => {
		if (!selectedReport) return;
		if (!confirm("Are you sure you want to suspend this user?")) return;
		try {
			await usersApi.suspendUser(selectedReport.reportedUserId);
			// Optionally also mark report as resolved
			await reportsApi.updateStatus(selectedReport.id, ReportStatus.RESOLVED);
			alert("User suspended and report resolved");
			setDialogOpen(false);
			fetchReports();
		} catch (e) {
			console.error(e);
			alert("Failed to suspend user");
		}
	};

	const handleDismiss = async () => {
		if (!confirm("Dismiss this report?")) return;
		handleUpdateStatus(ReportStatus.DISMISSED);
	};

	console.log(selectedReport);
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
								<TableCell className="font-medium">{report.reason}</TableCell>
								<TableCell>{report.reporterId}</TableCell>
								<TableCell>{report.reportedUserId}</TableCell>
								<TableCell>
									<span
										className={`px-2 py-1 rounded-full text-xs ${
											report.status === ReportStatus.PENDING
												? "bg-yellow-100 text-yellow-800"
												: report.status === ReportStatus.RESOLVED
													? "bg-green-100 text-green-800"
													: report.status === ReportStatus.DISMISSED
														? "bg-gray-100 text-gray-800"
														: "bg-blue-100 text-blue-800"
										}`}
									>
										{report.status}
									</span>
								</TableCell>
								<TableCell>
									{new Date(report.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleViewDetails(report.id)}
									>
										View Details
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				{/* Pagination Controls */}
				<div className="flex justify-between items-center p-4 border-t">
					<div className="text-sm text-gray-600">
						Page {data?.meta.page} of {data?.meta.totalPages} (
						{data?.meta.total} items)
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

			{/* Detail Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Report Details</DialogTitle>
						<DialogDescription>
							Review the report and take action.
						</DialogDescription>
					</DialogHeader>

					{selectedReport && (
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<span className="font-bold">Reason:</span>
								<span className="col-span-3">{selectedReport.reason}</span>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<span className="font-bold">Description:</span>
								<span className="col-span-3">
									{selectedReport.description || "No description provided"}
								</span>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<span className="font-bold">Status:</span>
								<span className="col-span-3">{selectedReport.status}</span>
							</div>

							<div className="border-t my-2"></div>

							<div className="grid grid-cols-4 items-center gap-4">
								<span className="font-bold">Reporter:</span>
								<div className="col-span-3">
									<p>{selectedReport.reporterNickname || "Unknown"}</p>
									<p className="text-xs text-gray-500">
										{selectedReport.reporterId}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<span className="font-bold">Reported User:</span>
								<div className="col-span-3">
									<p>
										{selectedReport.reportedNickname || "Unknown"} (
										{selectedReport.reportedEmail || "No Email"})
									</p>
									<p className="text-xs text-gray-500">
										{selectedReport.reportedUserId}
									</p>
								</div>
							</div>

							{selectedReport.definitionId && (
								<>
									<div className="border-t my-2" />
									<div className="grid gap-2">
										<span className="font-bold">
											Reported Content (Definition):
										</span>
										{selectedReport.wordTerm && (
											<div className="text-lg font-semibold mb-1">
												Word: {selectedReport.wordTerm}
											</div>
										)}
										<div className="bg-gray-50 p-3 rounded border text-sm max-h-40 overflow-y-auto mb-2">
											{selectedReport.definitionContent ||
												"Content not available"}
										</div>
										{selectedReport.definitionMediaUrls &&
											selectedReport.definitionMediaUrls.length > 0 && (
												<div className="grid grid-cols-3 gap-2">
													{selectedReport.definitionMediaUrls.map(
														(media, index) => (
															<img
																// biome-ignore lint/suspicious/noArrayIndexKey: media list has no stable id from API
																key={index}
																src={media.url}
																alt={`Media ${index}`}
																className="w-full h-24 object-cover rounded border"
															/>
														),
													)}
												</div>
											)}
									</div>
								</>
							)}
						</div>
					)}

					<DialogFooter className="sm:justify-between">
						<div className="flex gap-2">
							{selectedReport?.status === ReportStatus.PENDING && (
								<Button variant="secondary" onClick={handleDismiss}>
									Dismiss ReportDto
								</Button>
							)}
						</div>
						<div className="flex gap-2">
							{selectedReport?.status !== ReportStatus.RESOLVED && (
								<Button
									onClick={() => handleUpdateStatus(ReportStatus.RESOLVED)}
								>
									Mark Resolved
								</Button>
							)}
							<Button variant="destructive" onClick={handleSuspend}>
								Suspend User
							</Button>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
