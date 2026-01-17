import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("admin_users")
export class AdminUser {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ unique: true })
	username: string;

	@Column()
	password: string; // bcrypt hashed

	@Column({ name: "must_change_password", default: true })
	mustChangePassword: boolean;

	@Column({ name: "last_login", nullable: true })
	lastLogin: Date;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@DeleteDateColumn({ name: "deleted_at" })
	deletedAt: Date;
}
