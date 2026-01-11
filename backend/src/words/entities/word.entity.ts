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
import { Definition } from "../../definitions/entities/definition.entity";
import { User } from "../../users/entities/user.entity";

@Entity("words")
export class Word {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	term: string;

	@Column({ name: "user_id" })
	userId: string;

	@Column({ name: "is_public", default: false })
	isPublic: boolean;

	@ManyToOne(() => User)
	@JoinColumn({ name: "user_id" })
	user: User;

	@OneToMany(
		() => Definition,
		(definition) => definition.word,
	)
	definitions: Definition[];

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@DeleteDateColumn({ name: "deleted_at" })
	deletedAt: Date;
}
