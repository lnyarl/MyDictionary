import type { Definition } from "../../types/definition.types";
import { DefinitionCard } from "./DefinitionCard";

interface DefinitionListProps {
	definitions: Definition[];
	onDelete: (id: string) => void;
	onViewHistory: (userId: string) => void;
}

export function DefinitionList({
	definitions,
	onDelete,
	onViewHistory,
}: DefinitionListProps) {
	if (definitions.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-12 text-center">
				<p className="text-muted-foreground">
					아직 정의가 없습니다. 첫 정의를 추가해보세요!
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4">
			{definitions.map((definition) => (
				<DefinitionCard
					key={definition.id}
					definition={definition}
					onDelete={onDelete}
					onViewHistory={onViewHistory}
				/>
			))}
		</div>
	);
}
