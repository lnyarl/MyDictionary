import { useState } from "react";
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

export function WordForm({
	open,
	onOpenChange,
	onSubmit,
	word,
	mode,
}: WordFormProps) {
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
						<DialogTitle>
							{mode === "create" ? "새 단어 추가" : "단어 수정"}
						</DialogTitle>
						<DialogDescription>
							{mode === "create"
								? "사전에 추가할 단어를 입력하세요."
								: "단어를 수정하세요."}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="term">단어</Label>
							<Input
								id="term"
								value={term}
								onChange={(e) => setTerm(e.target.value)}
								placeholder="예: 행복"
								maxLength={100}
								autoFocus
							/>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<Label htmlFor="isPublic">공개 설정</Label>
								<p className="text-sm text-muted-foreground">
									공개 설정 시 다른 사용자도 이 단어와 정의를 볼 수 있습니다
								</p>
							</div>
							<Switch
								id="isPublic"
								checked={isPublic}
								onCheckedChange={setIsPublic}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							취소
						</Button>
						<Button type="submit" disabled={isSubmitting || !term.trim()}>
							{isSubmitting
								? "저장 중..."
								: mode === "create"
									? "추가"
									: "저장"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
