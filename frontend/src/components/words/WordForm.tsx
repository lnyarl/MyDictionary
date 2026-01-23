import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

interface WordFormProps {
	onSubmit: (term: string, isPublic: boolean) => Promise<void>;
	mode: "create" | "edit";
}

export function WordForm({ onSubmit, mode }: WordFormProps) {
	const { t } = useTranslation();
	const [term, setTerm] = useState("");
	const [isPublic, setIsPublic] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!term.trim()) return;

		setIsSubmitting(true);
		try {
			await onSubmit(term.trim(), isPublic);
			setTerm("");
			setIsPublic(false);
		} catch (error) {
			console.error("Failed to submit word:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h3>{mode === "create" ? t("word.add_new") : t("word.edit_word")}</h3>
			<div className="grid grid-cols-6 gap-4 py-4">
				<div className="grid gap-2 col-span-5">
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

			<div className="flex justify-end">
				<Button type="submit" disabled={isSubmitting || !term.trim()}>
					{isSubmitting
						? t("common.saving")
						: mode === "create"
							? t("common.add")
							: t("common.save")}
				</Button>
			</div>
		</form>
	);
}
