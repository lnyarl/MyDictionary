import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { definitionsApi } from "../../lib/definitions";
import type { Definition } from "../../types/definition.types";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";

interface DefinitionHistoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	wordId: string;
	userId: string;
	userName?: string;
}

export function DefinitionHistoryDialog({
	open,
	onOpenChange,
	wordId,
	userId,
	userName,
}: DefinitionHistoryDialogProps) {
	const { t } = useTranslation();
	const [definitions, setDefinitions] = useState<Definition[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchHistory = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await definitionsApi.getHistory(wordId, userId);
			setDefinitions(data);
		} catch (err: any) {
			setError(err.message || t("word.history_error"));
		} finally {
			setLoading(false);
		}
	}, [wordId, userId, t]);

	useEffect(() => {
		if (open && wordId && userId) {
			fetchHistory();
		}
	}, [open, wordId, userId, fetchHistory]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>{t("word.history_title")}</DialogTitle>
					<DialogDescription>
						{userName ? t("word.history_desc", { userName }) : t("word.history_desc_generic")}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto pr-4">
					{loading && (
						<div className="text-center py-8 text-muted-foreground">{t("common.loading")}</div>
					)}

					{error && <div className="text-center py-8 text-destructive">{error}</div>}

					{!loading && !error && definitions.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">{t("word.history_empty")}</div>
					)}

					{!loading && !error && definitions.length > 0 && (
						<div className="space-y-4">
							{definitions.map((definition, index) => (
								<div key={definition.id}>
									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm text-muted-foreground">
											<span>
												{new Date(definition.createdAt).toLocaleString("ko-KR", {
													year: "numeric",
													month: "long",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
											{index === 0 && (
												<span className="text-primary font-medium">{t("word.current")}</span>
											)}
										</div>
										<p className="whitespace-pre-wrap">{definition.content}</p>
									</div>
									{index < definitions.length - 1 && <Separator className="my-4" />}
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
