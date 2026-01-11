import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Like } from "../../likes/entities/like.entity";
import { User } from "../../users/entities/user.entity";
import { Word } from "../../words/entities/word.entity";

@Entity("definitions")
export class Definition {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("text")
	content: string;

	@Column({ name: "word_id" })
	wordId: string;

	@Column({ name: "user_id" })
	userId: string;

	@Column({ name: "likes_count", default: 0 })
	likesCount: number;

	@ManyToOne(
		() => Word,
		(word) => word.definitions,
	)
	@JoinColumn({ name: "word_id" })
	word: Word;

	@ManyToOne(() => User)
	@JoinColumn({ name: "user_id" })
	user: User;

	@OneToMany(
		() => Like,
		(like) => like.definition,
	)
	likes: Like[];

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@DeleteDateColumn({ name: "deleted_at" })
	deletedAt: Date;
}
