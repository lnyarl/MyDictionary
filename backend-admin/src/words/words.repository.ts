import { Injectable } from "@nestjs/common";
import { generateId, TABLES } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { Word } from "./entities/word.entity";

@Injectable()
export class WordsRepository extends BaseRepository {
  findByUserId(userId: string) {
    return this.query(TABLES.WORDS)
      .select<Word[]>({
        id: "id",
        term: "term",
        userId: "user_id",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
      })
      .where({ user_id: userId })
      .orderBy("created_at", "desc");
  }

  async createWithDefinition(
    wordData: Partial<Word>,
    definitionContent: string,
  ): Promise<void> {
    await this.transaction(async (trx) => {
      const [word] = await trx(TABLES.WORDS)
        .insert({
          id: generateId(),
          term: wordData.term,
          user_id: wordData.userId,
        })
        .returning("*");

      await trx(TABLES.DEFINITIONS).insert({
        id: generateId(),
        word_id: word.id,
        user_id: wordData.userId,
        content: definitionContent,
        is_public: true,
      });
    });
  }
}
