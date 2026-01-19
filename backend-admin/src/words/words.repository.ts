import { Injectable } from "@nestjs/common";
import { TABLES } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { Word } from "./entities/word.entity";

@Injectable()
export class WordsRepository extends BaseRepository {
  async findByUserId(userId: string): Promise<Word[]> {
    const rows = await this.query(TABLES.WORDS)
      .where({ user_id: userId })
      .orderBy("created_at", "desc");

    return rows.map(this.toEntity);
  }

  async createWithDefinition(wordData: Partial<Word>, definitionContent: string): Promise<void> {
    await this.transaction(async (trx) => {
      const [word] = await trx(TABLES.WORDS)
        .insert({
          term: wordData.term,
          user_id: wordData.userId,
          is_public: true,
        })
        .returning("*");

      await trx(TABLES.DEFINITIONS).insert({
        word_id: word.id,
        user_id: wordData.userId,
        content: definitionContent,
      });
    });
  }

  private toEntity(row: any): Word {
    return {
      id: row.id,
      term: row.term,
      userId: row.user_id,
      isPublic: row.is_public,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}
