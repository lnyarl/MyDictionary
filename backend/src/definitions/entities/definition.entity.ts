import { Like } from "../../likes/entities/like.entity";
import { User } from "../../users/entities/user.entity";
import { Word } from "../../words/entities/word.entity";

export class Definition {
  id: string;

  content: string;

  // word_id
  wordId: string;

  // user_id
  userId: string;

  // likes_count
  likesCount: number;

  // @JoinColumn({ name: "word_id" })
  word: Word;

  // @JoinColumn({ name: "user_id" })
  user: User;

  // @OneToMany(
  // 	() => Like,
  // 	(like) => like.definition,
  // )
  likes: Like[];

  // @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;
}
