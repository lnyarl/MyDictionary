import type { Definition } from "./definition.types";
import type { Word } from "./word.types";

export interface SearchResult extends Word {
	definitions?: Definition[];
}
