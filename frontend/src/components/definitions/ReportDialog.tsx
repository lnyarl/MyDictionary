import { ReportReason } from "@stashy/shared/entities/report.entity";
import { Flag } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { reportsApi } from "@/lib/api/reports";

type ReportDialogProps = {
	reportedUserId: string;
	definitionId?: string;
	trigger?: React.ReactNode;
}

export function ReportDialog({ reportedUserId, definitionId, trigger }: ReportDialogProps) {
	const { t } = useTranslation();
	const { toast } = useToast();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [reason, setReason] = useState<ReportReason | "">("");
	const [description, setDescription] = useState("");

	const handleSubmit = async () => {
		if (!reason) return;

		try {
			setLoading(true);
			await reportsApi.create({
				reportedUserId,
				definitionId,
				reason: reason as ReportReason,
				description,
			});

			toast({
				title: t("report.success_title", "Report submitted"),
				description: t(
					"report.success_message",
					"Thank you for your report. We will review it shortly.",
				),
			});
			setOpen(false);
			setReason("");
			setDescription("");
		} catch (error) {
			toast({
				variant: "destructive",
				title: t("common.error", "Error"),
				description: t("report.error_message", "Failed to submit report. Please try again."),
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="ghost" size="icon" title={t("common.report", "Report")}>
						<Flag className="h-4 w-4" />
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("report.title", "Report Content")}</DialogTitle>
					<DialogDescription>
						{t("report.description", "Please select a reason for reporting this content.")}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="report-reason">{t("report.reason", "Reason")}</Label>
						<select
							id="report-reason"
							className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							value={reason}
							onChange={(e) => setReason(e.target.value as ReportReason)}
						>
							<option value="" disabled>
								{t("report.select_reason", "Select a reason")}
							</option>
							{Object.values(ReportReason).map((r) => (
								<option key={r} value={r}>
									{t(`report.reasons.${r.toLowerCase()}`, r)}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="report-description">
							{t("report.details", "Additional Details (Optional)")}
						</Label>
						<Textarea
							id="report-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder={t(
								"report.details_placeholder",
								"Please provide any additional context...",
							)}
							className="resize-none"
							rows={4}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
						{t("common.cancel", "Cancel")}
					</Button>
					<Button onClick={handleSubmit} disabled={!reason || loading} variant="destructive">
						{loading
							? t("common.submitting", "Submitting...")
							: t("common.submit", "Submit Report")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
