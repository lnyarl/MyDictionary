import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { definitionsApi } from "../../lib/definitions";
import type { DefinitionHistory } from "../../types/definition.types";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";

interface DefinitionHistoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	definitionId: string;
}

export function DefinitionHistoryDialog({
	open,
	onOpenChange,
	definitionId,
}: DefinitionHistoryDialogProps) {
	const { t } = useTranslation();
	const [histories, setHistories] = useState<DefinitionHistory[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchHistory = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await definitionsApi.getHistory(definitionId);
			setHistories(data);
		} catch (err: any) {
			setError(err.message || t("word.history_error"));
		} finally {
			setLoading(false);
		}
	}, [definitionId, t]);

	useEffect(() => {
		if (open && definitionId) {
			fetchHistory();
		}
	}, [open, definitionId, fetchHistory]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>{t("word.history_title")}</DialogTitle>
					<DialogDescription>{t("word.history_desc_generic")}</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto pr-4">
					{loading && (
						<div className="text-center py-8 text-muted-foreground">{t("common.loading")}</div>
					)}

					{error && <div className="text-center py-8 text-destructive">{error}</div>}

					{!loading && !error && histories.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">{t("word.history_empty")}</div>
					)}

					{!loading && !error && histories.length > 0 && (
						<div className="space-y-4">
							{histories.map((history, index) => (
								<div key={history.id}>
									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm text-muted-foreground">
											<span>
												{new Date(history.createdAt).toLocaleString("ko-KR", {
													year: "numeric",
													month: "long",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
										<p className="whitespace-pre-wrap">{history.content}</p>
										{history.tags && history.tags.length > 0 && (
											<div className="flex flex-wrap gap-1">
												{history.tags.map((tag) => (
													<span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded">
														#{tag}
													</span>
												))}
											</div>
										)}
									</div>
									{index < histories.length - 1 && <Separator className="my-4" />}
								</div>
							))}
						</div>
					)}
				</div>

				<div className="flex justify-end border-t pt-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("common.close")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
