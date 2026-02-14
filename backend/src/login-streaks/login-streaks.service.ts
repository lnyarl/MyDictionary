import { Injectable, Logger } from "@nestjs/common";
import { UserLoginStreaks } from "@stashy/shared/types/db_entity.generated";
import { LoginStreaksRepository } from "./login-streaks.repository";

@Injectable()
export class LoginStreaksService {
  private readonly logger = new Logger(LoginStreaksService.name);

  constructor(private readonly loginStreaksRepository: LoginStreaksRepository) {}

  async recordLogin(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingStreak = await this.loginStreaksRepository.findByUserId(userId);

    if (!existingStreak) {
      await this.loginStreaksRepository.create(userId, today);
      this.logger.log(`First login recorded for user ${userId}, streak: 1`);
      return { areadyChecked: false, streak: 1 };
    }

    const lastLoginDate = existingStreak.lastLoginAt;
    lastLoginDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastLoginDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      this.logger.debug(
        `User ${userId} already logged in today, streak: ${existingStreak.currentStreak}`,
      );
      return { areadyChecked: true, streak: existingStreak.currentStreak };
    }

    let newStreak = 1;
    let newLongestStreak = existingStreak.longestStreak;

    if (diffDays === 1) {
      newStreak = existingStreak.currentStreak + 1;
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }
      this.logger.log(`User ${userId} continued streak: ${newStreak}`);
    } else {
      newStreak = 1;
      this.logger.log(`User ${userId} streak reset, starting new streak: 1`);
    }

    await this.loginStreaksRepository.updateStreak(userId, newStreak, newLongestStreak, today);

    return { areadyChecked: false, streak: newStreak };
  }

  async getStreak(userId: string) {
    return await this.loginStreaksRepository.findByUserId(userId);
  }
}
