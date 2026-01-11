import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
	UpdateDateColumn,
} from "typeorm";
import { Definition } from "../../definitions/entities/definition.entity";
import { User } from "../../users/entities/user.entity";

@Entity("likes")
@Unique(["userId", "definitionId"])
export class Like {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ name: "user_id" })
	userId: string;

	@Column({ name: "definition_id" })
	definitionId: string;

	@ManyToOne(() => User)
	@JoinColumn({ name: "user_id" })
	user: User;

	@ManyToOne(
		() => Definition,
		(definition) => definition.likes,
	)
	@JoinColumn({ name: "definition_id" })
	definition: Definition;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@DeleteDateColumn({ name: "deleted_at" })
	deletedAt: Date;
}
