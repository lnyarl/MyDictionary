import { User } from "../../users/entities/user.entity";

// @Entity("follows")
// @Unique(["followerId", "followingId"])
export class Follow {
  // @PrimaryGeneratedColumn("uuid")
  id: string;

  // @Column({ name: "follower_id" })
  followerId: string;

  // @Column({ name: "following_id" })
  followingId: string;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: "follower_id" })
  follower: User;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: "following_id" })
  following: User;

  // @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;
}

export const FollowSelect = {
  id: "id",
  followerId: "follower_id",
  followingId: "following_id",
  createdAt: "created_at",
  updatedAt: "updated_at",
  deletedAt: "deleted_at",
} as const;
