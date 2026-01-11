import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { PaginatedResponseDto, PaginationDto } from "../common/dto/pagination.dto";
import type { Definition } from "../definitions/entities/definition.entity";
import { CreateWordDto } from "./dto/create-word.dto";
import { UpdateWordDto } from "./dto/update-word.dto";
import { Word } from "./entities/word.entity";
import { buildWordSearchQuery, normalizeSearchTerm } from "./logic/word-search.logic";

@Injectable()
export class WordsService {
	constructor(
		@InjectRepository(Word)
		private readonly wordRepository: Repository<Word>,
	) { }

	/**
	 * Filter definitions to show only latest per user
	 */
	private filterLatestDefinitionsPerUser(words: Word[]): Word[] {
		return words.map((word) => {
			if (!word.definitions || word.definitions.length === 0) {
				return word;
			}

			// Group by userId and get latest
			const definitionsByUser = new Map<string, Definition>();

			for (const def of word.definitions) {
				const existing = definitionsByUser.get(def.userId);
				if (!existing || new Date(def.createdAt) > new Date(existing.createdAt)) {
					definitionsByUser.set(def.userId, def);
				}
			}

			return {
				...word,
				definitions: Array.from(definitionsByUser.values()).sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				),
			};
		});
	}

	async create(userId: string, createWordDto: CreateWordDto): Promise<Word> {
		const word = this.wordRepository.create({
			...createWordDto,
			userId,
		});
		return this.wordRepository.save(word);
	}

	async findAllByUser(userId: string): Promise<Word[]> {
		return this.wordRepository.find({
			where: { userId },
			order: { createdAt: "DESC" },
		});
	}

	async findOne(id: string, userId?: string): Promise<Word> {
		const word = await this.wordRepository.findOne({ where: { id } });

		if (!word) {
			throw new NotFoundException("Word not found");
		}

		// Check access: private words only accessible by owner
		if (!word.isPublic && (!userId || word.userId !== userId)) {
			throw new ForbiddenException("You do not have access to this word");
		}

		return word;
	}

	async update(id: string, userId: string, updateWordDto: UpdateWordDto): Promise<Word> {
		const word = await this.findOne(id, userId);

		Object.assign(word, updateWordDto);
		return this.wordRepository.save(word);
	}

	async remove(id: string, userId: string): Promise<void> {
		const _word = await this.findOne(id, userId);
		await this.wordRepository.softDelete(id);
	}

	async search(term: string, paginationDto: PaginationDto, userId?: string): Promise<PaginatedResponseDto<Word>> {
		const normalizedTerm = normalizeSearchTerm(term);

		if (!normalizedTerm) {
			return new PaginatedResponseDto<Word>([], 0, paginationDto.page, paginationDto.limit);
		}

		const queryBuilder = buildWordSearchQuery(this.wordRepository, {
			term: normalizedTerm,
			userId,
			limit: paginationDto.limit,
			offset: paginationDto.offset,
		});

		const [words, total] = await queryBuilder.getManyAndCount();

		// Filter to show only latest definition per user
		const filteredWords = this.filterLatestDefinitionsPerUser(words);

		return new PaginatedResponseDto<Word>(filteredWords, total, paginationDto.page, paginationDto.limit);
	}
}
