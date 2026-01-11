import { ArrowLeft, Globe, Lock, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DefinitionHistoryDialog } from "../components/definitions/DefinitionHistoryDialog";
import { DefinitionList } from "../components/definitions/DefinitionList";
import { Page } from "../components/layout/Page";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { useSearch } from "../hooks/useSearch";
import type { Definition } from "../types/definition.types";

export default function SearchResultsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const { results, loading, error, total, search } = useSearch();
	const { isAuthenticated } = useAuth();
	const { toast } = useToast();

	const [searchTerm, setSearchTerm] = useState(searchParams.get("term") || "");
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

	useEffect(() => {
		const term = searchParams.get("term");
		if (term) {
			console.log("@! search term", searchParams, term);
			search(term);
		}
	}, [searchParams, search]);

	useEffect(() => {
		if (error) {
			toast({
				title: "오류",
				description: error,
				variant: "destructive",
			});
		}
	}, [error, toast]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchTerm.trim()) {
			setSearchParams({ term: searchTerm.trim() });
		}
	};

	const handleViewHistory = (wordId: string, userId: string) => {
		setSelectedWordId(wordId);
		setSelectedUserId(userId);
		setIsHistoryOpen(true);
	};

	return (
		<Page>
			<Button
				variant="ghost"
				onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
				className="mb-4"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				{isAuthenticated ? "대시보드로 돌아가기" : "홈으로 돌아가기"}
			</Button>

				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-4">단어 검색</h1>
					<form onSubmit={handleSearch} className="flex gap-2">
						<Input
							type="text"
							placeholder="단어를 검색하세요..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="flex-1"
						/>
						<Button type="submit">
							<Search className="mr-2 h-4 w-4" />
							검색
						</Button>
					</form>
				</div>

				{loading && (
					<div className="rounded-lg border bg-muted/50 p-12 text-center">
						<p className="text-muted-foreground">검색 중...</p>
					</div>
				)}

				{!loading && searchParams.get("term") && (
					<div className="space-y-6">
						<div>
							<h2 className="text-xl font-semibold mb-2">
								"{searchParams.get("term")}" 검색 결과
							</h2>
							<p className="text-muted-foreground">
								{total}개의 단어를 찾았습니다
							</p>
						</div>

						{results.length === 0 ? (
							<div className="rounded-lg border border-dashed p-12 text-center">
								<p className="text-muted-foreground">
									검색 결과가 없습니다. 다른 단어로 검색해보세요.
								</p>
							</div>
						) : (
							<div className="space-y-6">
								{results.map((word) => (
									<Card key={word.id}>
										<CardHeader>
											<div className="flex items-center justify-between">
												<CardTitle className="text-2xl">{word.term}</CardTitle>
												<div className="flex items-center gap-4">
													<div className="flex items-center gap-2 text-sm text-muted-foreground">
														{word.isPublic ? (
															<>
																<Globe className="h-4 w-4" />
																<span>공개</span>
															</>
														) : (
															<>
																<Lock className="h-4 w-4" />
																<span>비공개</span>
															</>
														)}
													</div>
													<p className="text-sm text-muted-foreground">
														{new Date(word.createdAt).toLocaleDateString("ko-KR")}
													</p>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											{word.definitions && word.definitions.length > 0 ? (
												<div className="space-y-2">
													<h3 className="font-semibold mb-2">정의</h3>
													<Separator />
													<DefinitionList
														definitions={word.definitions as Definition[]}
														onDelete={() => { }}
														onViewHistory={(userId) => handleViewHistory(word.id, userId)}
													/>
												</div>
											) : (
												<p className="text-muted-foreground">
													이 단어에는 아직 정의가 없습니다.
												</p>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				)}

			{selectedWordId && selectedUserId && (
				<DefinitionHistoryDialog
					open={isHistoryOpen}
					onOpenChange={setIsHistoryOpen}
					wordId={selectedWordId}
					userId={selectedUserId}
					userName={
						results
							.find((w) => w.id === selectedWordId)
							?.definitions?.find((d) => d.userId === selectedUserId)?.user
							?.nickname
					}
				/>
			)}
		</Page>
	);
}
