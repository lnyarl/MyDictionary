import { useState } from "react";
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

export function DefinitionForm({
	open,
	onOpenChange,
	onSubmit,
}: DefinitionFormProps) {
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
						<DialogTitle>새 정의 추가</DialogTitle>
						<DialogDescription>
							단어의 정의를 작성하세요.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="content">정의</Label>
							<Textarea
								id="content"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="예: 마음에 흐뭇하고 즐거운 느낌이 있는 상태"
								rows={6}
								maxLength={5000}
								autoFocus
							/>
							<p className="text-sm text-muted-foreground">
								{content.length}/5000
							</p>
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
						<Button type="submit" disabled={isSubmitting || !content.trim()}>
							{isSubmitting ? "저장 중..." : "추가"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
