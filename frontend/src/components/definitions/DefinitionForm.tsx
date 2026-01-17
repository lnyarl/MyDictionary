import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface DefinitionFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (content: string) => Promise<void>;
}

export function DefinitionForm({ open, onOpenChange, onSubmit }: DefinitionFormProps) {
	const { t } = useTranslation();
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		setIsSubmitting(true);
		try {
			await onSubmit(content.trim());
			setContent("");
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to submit definition:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setContent("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{t("word.add_definition")}</DialogTitle>
						<DialogDescription>{t("word.definition_desc")}</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="content">{t("word.definition")}</Label>
							<Textarea
								id="content"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder={t("word.definition_placeholder")}
								rows={6}
								maxLength={5000}
								autoFocus
							/>
							<p className="text-sm text-muted-foreground">{content.length}/5000</p>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
							{t("common.cancel")}
						</Button>
						<Button type="submit" disabled={isSubmitting || !content.trim()}>
							{isSubmitting ? t("common.saving") : t("common.add")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
