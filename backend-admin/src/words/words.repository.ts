import { Injectable } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";
import { Word } from "./entities/word.entity";

@Injectable()
export class WordsRepository extends BaseRepository {
  findByUserId(userId: string) {
    return this.query("words")
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
      let term = await trx("terms").where({ text: wordData.term });
      if (term.length === 0) {
        term = await trx("terms")
          .insert({
            id: generateId(),
            text: wordData.term,
          })
          .returning(["id", "number"]);
      }
      const [word] = await trx("words")
        .insert({
          id: generateId(),
          term: wordData.term,
          user_id: wordData.userId,
        })
        .returning("*");

      console.log(term);
      await trx("definitions").insert({
        id: generateId(),
        word_id: word.id,
        user_id: wordData.userId,
        content: definitionContent,
        term_id: term[0].id,
        is_public: true,
      });
    });
  }
}
