import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { Definition } from "../definitions/entities/definition.entity";
import { Like } from "./entities/like.entity";

@Injectable()
export class LikesService {
	constructor(
		@InjectRepository(Like)
		private readonly likeRepository: Repository<Like>,
		@InjectRepository(Definition)
		private readonly definitionRepository: Repository<Definition>,
	) { }

	async toggle(userId: string, definitionId: string): Promise<boolean> {
		// Check if definition exists and is accessible
		const definition = await this.definitionRepository.findOne({
			where: { id: definitionId },
		});

		if (!definition) {
			throw new NotFoundException("Definition not found");
		}

		// Cannot like your own definition
		if (definition.userId === userId) {
			throw new ForbiddenException("You cannot like your own definition");
		}

		// Check if like already exists
		const existingLike = await this.likeRepository.findOne({
			where: { userId, definitionId },
			withDeleted: false,
		});

		if (existingLike) {
			// Unlike: soft delete the like and decrement count
			await this.likeRepository.softDelete(existingLike.id);
			await this.definitionRepository.decrement(
				{ id: definitionId },
				"likesCount",
				1,
			);
			return false; // unliked
		}
		// Like: create new like and increment count
		const newLike = this.likeRepository.create({ userId, definitionId });
		await this.likeRepository.save(newLike);
		await this.definitionRepository.increment(
			{ id: definitionId },
			"likesCount",
			1,
		);
		return true; // liked
	}

	async checkUserLike(userId: string, definitionId: string): Promise<boolean> {
		const like = await this.likeRepository.findOne({
			where: { userId, definitionId },
		});
		return !!like;
	}

	async getLikesByDefinition(definitionId: string): Promise<Like[]> {
		return this.likeRepository.find({
			where: { definitionId },
			relations: ["user"],
		});
	}
}
