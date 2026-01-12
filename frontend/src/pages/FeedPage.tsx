import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { DefinitionCard } from "../components/definitions/DefinitionCard";
import { Page } from "../components/layout/Page";
import { Button } from "../components/ui/button";
import { useFeed } from "../hooks/useFeed";

export default function FeedPage() {
	const { definitions, loading, fetchFeed, loadMore, hasMore } = useFeed();

	useEffect(() => {
		fetchFeed();
	}, [fetchFeed]);

	const handleDelete = async () => {
		// Definitions in feed are from other users, so no delete
		// Refresh feed after any action if needed
		fetchFeed(1);
	};

	const handleViewHistory = () => {
		// Already handled in DefinitionCard
	};

	return (
		<Page>
			<div className="mb-8">
				<h1 className="text-3xl font-bold">피드</h1>
				<p className="text-muted-foreground mt-2">
					내가 팔로우하는 사용자들의 최신 정의를 확인하세요.
				</p>
			</div>

			{loading && definitions.length === 0 ? (
				<div className="rounded-lg border bg-muted/50 p-12 text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
					<p className="text-muted-foreground">로딩 중...</p>
				</div>
			) : definitions.length === 0 ? (
				<div className="rounded-lg border border-dashed p-12 text-center">
					<p className="text-muted-foreground">
						아직 피드가 비어있습니다. 다른 사용자를 팔로우해보세요!
					</p>
				</div>
			) : (
				<>
					<div className="space-y-4">
						{definitions.map((definition) => (
							<DefinitionCard
								key={definition.id}
								definition={definition}
								onDelete={handleDelete}
								onViewHistory={handleViewHistory}
								showWord={true}
							/>
						))}
					</div>

					{hasMore && (
						<div className="mt-8 text-center">
							<Button onClick={loadMore} disabled={loading} variant="outline">
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										로딩 중...
									</>
								) : (
									"더 보기"
								)}
							</Button>
						</div>
					)}
				</>
			)}
		</Page>
	);
}
