import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toDayString } from "@/lib/utils/date";
import { wordsApi } from "../../lib/words";
import type { CreateWordInput, Word } from "../../types/word.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RichTextEditor } from "../ui/rich-text-editor";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

interface WordFormProps {
	onCreate: (data: CreateWordInput) => Promise<void>;
}

export function FeedForm({ onCreate }: WordFormProps) {
	const { t } = useTranslation();
	const today = toDayString();
	const [term, setTerm] = useState(today);
	const [suggestions, setSuggestions] = useState<{
		myWords: Word[];
		othersWords: Word[];
	}>({ myWords: [], othersWords: [] });
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [definition, setDefinition] = useState<{
		content: string;
		tags: string;
		isPublic: boolean;
	}>({ content: "", tags: "", isPublic: true });
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const fetchSuggestions = async () => {
			if (term === today) return;
			if (!term.trim() || term.length < 2) {
				setSuggestions({ myWords: [], othersWords: [] });
				return;
			}
			try {
				const response = await wordsApi.autocomplete(term);
				setSuggestions(response);
				setShowSuggestions(true);
			} catch (error) {
				console.error("Failed to fetch suggestions:", error);
			}
		};

		const timeoutId = setTimeout(fetchSuggestions, 300);
		return () => clearTimeout(timeoutId);
	}, [term, today]);

	const handleSelectSuggestion = (word: Word) => {
		setTerm(word.term);
		setShowSuggestions(false);
		setSuggestions({ myWords: [], othersWords: [] });
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && e.metaKey) {
			handleSubmit(e);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!term.trim()) {
			document.getElementById("term")?.focus();
			return;
		}
		if (!definition.content.trim()) return;

		setIsSubmitting(true);
		try {
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
			setTerm(toDayString());
			setDefinition({ content: "", tags: "", isPublic: true });
		} catch (error) {
			console.error("Failed to submit word:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<h3 className="text-lg font-medium">{t("word.add_new")}</h3>
			<div className="rounded-lg border bg-card shadow-sm focus-within:ring-1 focus-within:ring-ring transition-all">
				<div className="relative">
					<Input
						id="term"
						value={term}
						onChange={(e) => setTerm(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={() => {
							if (suggestions.myWords.length > 0 || suggestions.othersWords.length > 0)
								setShowSuggestions(true);
						}}
						onBlur={() => {
							setTimeout(() => setShowSuggestions(false), 200);
						}}
						maxLength={100}
						autoComplete="off"
						className="border-0 focus-visible:ring-0 shadow-none rounded-t-lg rounded-b-none text-lg font-medium px-4 py-3 h-auto"
						placeholder={t("word.term_placeholder")}
					/>
					{showSuggestions &&
						(suggestions.myWords.length > 0 || suggestions.othersWords.length > 0) && (
							<div className="absolute top-full left-0 w-full z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
								<ul className="max-h-75 overflow-auto py-1">
									{suggestions.myWords.length > 0 && (
										<>
											<li className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
												{t("word.my_words")}
											</li>
											{suggestions.myWords.map((word) => (
												<li
													key={word.id}
													className="relative flex cursor-pointer select-none items-center rounded-sm px-4 py-1.5 text-sm outline-none bg-blue-50/50 hover:bg-blue-100 hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
													onClick={() => handleSelectSuggestion(word)}
												>
													{word.term}
												</li>
											))}
										</>
									)}
									{suggestions.othersWords.length > 0 && (
										<>
											<li className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 border-t">
												{t("word.others_words")}
											</li>
											{suggestions.othersWords.map((word) => (
												<li
													key={word.id}
													className="relative flex cursor-pointer select-none items-center rounded-sm px-4 py-1.5 text-sm outline-none bg-blue-50/50 hover:bg-blue-100 hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
													onClick={() => handleSelectSuggestion(word)}
												>
													{word.term}
												</li>
											))}
										</>
									)}
								</ul>
							</div>
						)}
				</div>
				<div className="px-3">
					<Separator className="w-full" />
				</div>
				<RichTextEditor
					value={definition.content}
					onChange={(value) => setDefinition({ ...definition, content: value })}
					onKeyDown={handleKeyDown}
					className="border-0 focus-visible:ring-0 shadow-none rounded-none min-h-[120px] px-4 py-2"
					autoFocus
				/>
				<div className="px-3">
					<Separator className="w-full" />
				</div>
				<Input
					value={definition.tags}
					onChange={(e) => setDefinition({ ...definition, tags: e.target.value })}
					placeholder={t("word.tags_placeholder")}
					className="border-0 focus-visible:ring-0 shadow-none rounded-b-lg rounded-t-none px-4 py-3 h-auto"
				/>
			</div>

			<div className="flex items-center justify-end pt-2 gap-6">
				<div className="flex items-center gap-2">
					<Switch
						checked={definition.isPublic}
						onCheckedChange={(checked: boolean) =>
							setDefinition({ ...definition, isPublic: checked })
						}
						id="public-mode"
					/>
					<Label htmlFor="public-mode" className="text-sm cursor-pointer">
						{t("word.public")}
					</Label>
				</div>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? t("common.saving") : t("common.add")}
				</Button>
			</div>
		</form>
	);
}
