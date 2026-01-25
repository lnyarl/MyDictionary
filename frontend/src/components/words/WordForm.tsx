import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface WordFormProps {
	onSubmit: (term: string) => Promise<void>;
	mode: "create" | "edit";
}

export function WordForm({ onSubmit, mode }: WordFormProps) {
	const { t } = useTranslation();
	const [term, setTerm] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!term.trim()) return;

		setIsSubmitting(true);
		try {
			await onSubmit(term.trim());
			setTerm("");
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
