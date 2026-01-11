import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { Word } from "../words/entities/word.entity";
import { CreateDefinitionDto } from "./dto/create-definition.dto";
import { Definition } from "./entities/definition.entity";

@Injectable()
export class DefinitionsService {
	constructor(
		@InjectRepository(Definition)
		private readonly definitionRepository: Repository<Definition>,
		@InjectRepository(Word)
		private readonly wordRepository: Repository<Word>,
	) { }

	async create(
		userId: string,
		createDefinitionDto: CreateDefinitionDto,
	): Promise<Definition> {
		// Verify word exists
		const word = await this.wordRepository.findOne({
			where: { id: createDefinitionDto.wordId },
		});

		if (!word) {
			throw new NotFoundException("Word not found");
		}

		// Check access: only owner can add definitions to private words
		if (!word.isPublic && word.userId !== userId) {
			throw new ForbiddenException("You do not have access to this word");
		}

		const definition = this.definitionRepository.create({
			...createDefinitionDto,
			userId,
		});

		return this.definitionRepository.save(definition);
	}

	async findAllByWord(wordId: string, userId?: string): Promise<Definition[]> {
		// Check if word exists and verify access
		const word = await this.wordRepository.findOne({
			where: { id: wordId },
		});

		if (!word) {
			throw new NotFoundException("Word not found");
		}

		// Check access based on word's isPublic
		if (!word.isPublic && (!userId || word.userId !== userId)) {
			throw new ForbiddenException("You do not have access to this word");
		}

		// Get latest definition per user using raw query with window function
		const results = await this.definitionRepository.query(
			`
			SELECT d.*, u.id as "user_id", u.nickname as "user_nickname"
			FROM (
				SELECT *,
					ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
				FROM definitions
				WHERE word_id = $1 AND deleted_at IS NULL
			) d
			LEFT JOIN users u ON d.user_id = u.id
			WHERE d.rn = 1
			ORDER BY d.created_at DESC
			`,
			[wordId],
		);

		// Map raw query results to Definition entities
		return results.map((row: any) => {
			const definition = new Definition();
			definition.id = row.id;
			definition.content = row.content;
			definition.wordId = row.word_id;
			definition.userId = row.user_id;
			definition.likesCount = row.likes_count;
			definition.createdAt = row.created_at;
			definition.updatedAt = row.updated_at;
			definition.user = {
				id: row.user_id,
				nickname: row.user_nickname,
			} as any;
			return definition;
		});
	}

	async findOne(id: string, userId?: string): Promise<Definition> {
		const definition = await this.definitionRepository.findOne({
			where: { id },
			relations: ["word"],
		});

		if (!definition) {
			throw new NotFoundException("Definition not found");
		}

		// Check access based on word's isPublic
		if (!definition.word.isPublic) {
			if (!userId || (definition.word.userId !== userId && definition.userId !== userId)) {
				throw new ForbiddenException(
					"You do not have access to this definition",
				);
			}
		}

		return definition;
	}

	async remove(id: string, userId: string): Promise<void> {
		const definition = await this.definitionRepository.findOne({
			where: { id },
		});

		if (!definition) {
			throw new NotFoundException("Definition not found");
		}

		if (definition.userId !== userId) {
			throw new ForbiddenException(
				"You do not have permission to delete this definition",
			);
		}

		await this.definitionRepository.softDelete(id);
	}

	async getHistory(
		wordId: string,
		targetUserId: string,
		requestUserId?: string,
	): Promise<Definition[]> {
		// Check word access
		const word = await this.wordRepository.findOne({
			where: { id: wordId },
		});

		if (!word) {
			throw new NotFoundException("Word not found");
		}

		// Check if requester has access to the word
		if (!word.isPublic && (!requestUserId || word.userId !== requestUserId)) {
			throw new ForbiddenException("You do not have access to this word");
		}

		// Get all definitions from the target user for this word
		const definitions = await this.definitionRepository
			.createQueryBuilder("definition")
			.leftJoinAndSelect("definition.user", "user")
			.where("definition.word_id = :wordId", { wordId })
			.andWhere("definition.user_id = :targetUserId", { targetUserId })
			.orderBy("definition.created_at", "DESC")
			.getMany();

		return definitions;
	}
}
