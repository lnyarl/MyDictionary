import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Word } from "../../types/word.types";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

interface WordFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (term: string, isPublic: boolean) => Promise<void>;
	word?: Word;
	mode: "create" | "edit";
}

export function WordForm({ open, onOpenChange, onSubmit, word, mode }: WordFormProps) {
	const { t } = useTranslation();
	const [term, setTerm] = useState(word?.term || "");
	const [isPublic, setIsPublic] = useState(word?.isPublic || false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!term.trim()) return;

		setIsSubmitting(true);
		try {
			await onSubmit(term.trim(), isPublic);
			setTerm("");
			setIsPublic(false);
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to submit word:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setTerm(word?.term || "");
		setIsPublic(word?.isPublic || false);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{mode === "create" ? t("word.add_new") : t("word.edit_word")}</DialogTitle>
						<DialogDescription>
							{mode === "create" ? t("word.add_desc") : t("word.edit_desc")}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="term">{t("word.term")}</Label>
							<Input
								id="term"
								value={term}
								onChange={(e) => setTerm(e.target.value)}
								placeholder={t("word.term_placeholder")}
								maxLength={100}
								autoFocus
							/>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<Label htmlFor="isPublic">{t("word.public_setting")}</Label>
								<p className="text-sm text-muted-foreground">{t("word.public_desc")}</p>
							</div>
							<Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
							{t("common.cancel")}
						</Button>
						<Button type="submit" disabled={isSubmitting || !term.trim()}>
							{isSubmitting
								? t("common.saving")
								: mode === "create"
									? t("common.add")
									: t("common.save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
