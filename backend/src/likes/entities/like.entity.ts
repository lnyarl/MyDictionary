import { Definition } from "@stashy/shared";
import { User } from "../../users/entities/user.entity";

// @Entity("likes")
// @Unique(["userId", "definitionId"])
export class Like {
  // @PrimaryGeneratedColumn("uuid")
  id: string;

  // @Column({ name: "user_id" })
  userId: string;

  // @Column({ name: "definition_id" })
  definitionId: string;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: "user_id" })
  user: User;

  // @ManyToOne(
  // 	() => Definition,
  // 	(definition) => definition.likes,
  // )
  // @JoinColumn({ name: "definition_id" })
  definition: Definition;

  // @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;
}

export const LikeSelect = {
  id: "id",
  userId: "user_id",
  definitionId: "definition_id",
  createdAt: "created_at",
  updatedAt: "updated_at",
  deletedAt: "deleted_at",
} as const;
