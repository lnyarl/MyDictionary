import type { Repository, SelectQueryBuilder } from "typeorm";
import type { Word } from "../entities/word.entity";

export interface SearchWordOptions {
	term: string;
	userId?: string;
	limit?: number;
	offset?: number;
}

/**
 * Build a search query for words with their definitions
 * - Returns words that match the search term
 * - Includes words based on visibility
 * - For logged-in users: their own words (public + private) and others' public words
 * - For anonymous users: only public words
 */
export function buildWordSearchQuery(
	wordRepository: Repository<Word>,
	options: SearchWordOptions,
): SelectQueryBuilder<Word> {
	const { term, userId, limit = 20, offset = 0 } = options;

	const queryBuilder = wordRepository
		.createQueryBuilder("word")
		.leftJoinAndSelect("word.definitions", "definition")
		.leftJoinAndSelect("definition.user", "definitionUser")
		.leftJoinAndSelect("word.user", "wordUser")
		.where("word.term ILIKE :term", { term: `%${term}%` });

	// Filter words based on visibility
	if (userId) {
		// Logged-in user: show their own words (public + private) and others' public words
		queryBuilder.andWhere(
			"(word.userId = :userId OR word.isPublic = true)",
			{ userId },
		);
	} else {
		// Anonymous user: only show public words
		queryBuilder.andWhere("word.isPublic = true");
	}

	queryBuilder
		.orderBy("word.createdAt", "DESC")
		.addOrderBy("definition.createdAt", "DESC")
		.take(limit)
		.skip(offset);

	return queryBuilder;
}

/**
 * Extract search term from query string
 * Trims whitespace and returns empty string if invalid
 */
export function normalizeSearchTerm(term: string | undefined): string {
	if (!term || typeof term !== "string") {
		return "";
	}
	return term.trim();
}
