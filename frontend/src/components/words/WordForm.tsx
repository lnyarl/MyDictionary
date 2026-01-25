import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CreateWordInput, UpdateWordInput } from "../../types/word.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

interface WordFormProps {
	onCreate?: (data: CreateWordInput) => Promise<void>;
	onUpdate?: (data: UpdateWordInput) => Promise<void>;
	initialData?: Partial<CreateWordInput>;
}

export function WordForm({ onCreate, onUpdate, initialData }: WordFormProps) {
	const { t } = useTranslation();
	const [term, setTerm] = useState(initialData?.term || "");
	const [definition, setDefinition] = useState<
		{ content: string; tags: string; isPublic: boolean }
	>({ content: "", tags: "", isPublic: false });
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!term.trim()) return;

		setIsSubmitting(true);
		try {
			if (onCreate) {
				const formattedDefinition = {
					content: definition.content.trim(),
					tags: definition.tags
						.split(/\s+/)
						.map((tag) => tag.trim())
						.filter((tag) => tag.length > 0),
					isPublic: definition.isPublic,
				};

				await onCreate({
					term: term.trim(),
					definition: formattedDefinition,
				} as CreateWordInput);

				// Reset form
				setTerm("");
				setDefinition({ content: "", tags: "", isPublic: false });
			} else if (onUpdate) {
				await onUpdate({ term: term.trim() });
			}
		} catch (error) {
			console.error("Failed to submit word:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">
					{onCreate ? t("word.add_new") : t("word.edit_word")}
				</h3>
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
			</div>

			{onCreate && (
				<div className="space-y-4">
					<div className="rounded-lg border p-4 space-y-4 bg-card">
						<div className="flex justify-between items-start">
							<Label className="text-xs text-muted-foreground">
								{t("word.definition")}
							</Label>
						</div>

						<Textarea
							value={definition.content}
							onChange={(e) => setDefinition({ ...definition, content: e.target.value })}
							placeholder={t("word.definition_placeholder")}
							className="min-h-25"
						/>

						<div className="flex items-center gap-4">
							<div className="flex-1">
								<Input
									value={definition.tags}
									onChange={(e) => setDefinition({ ...definition, tags: e.target.value })}
									placeholder={t("word.tags_placeholder")}
									className="h-8 text-sm"
								/>
							</div>
							<div className="flex items-center gap-2">
								<Switch
									checked={definition.isPublic}
									onCheckedChange={(checked: boolean) =>
										setDefinition({ ...definition, isPublic: checked })
									}
								/>
								<Label className="text-xs">{t("word.public")}</Label>
							</div>
						</div>
					</div>
				</div>
			)}

			<Separator />

			<div className="flex justify-end">
				<Button type="submit" disabled={isSubmitting || !term.trim()}>
					{isSubmitting
						? t("common.saving")
						: onCreate
							? t("common.add")
							: t("common.save")}
				</Button>
			</div>
		</form>
	);
}
