// Constants

export { CreateBadgeDto } from "./admin/dto/badge/create-badge.dto";
export { UpdateBadgeDto } from "./admin/dto/badge/update-badge.dto";
export type { ApiErrorResponse, ErrorCode } from "./constants/error-codes";
export { ERROR_CODES } from "./constants/error-codes";
export type { SupportedLanguage } from "./constants/languages";
export {
  DEFAULT_LANGUAGE,
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
} from "./constants/languages";
export type { TableName } from "./constants/tables";
export { TABLES } from "./constants/tables";
// DTOs
export { PaginatedResponseDto, PaginationDto } from "./dto/pagination.dto";
export type {
  BadgeEntity,
  BadgeWithProgress,
  UserBadgeEntity,
  UserBadgeProgressEntity,
} from "./entities/badge.entity";
export { EventType } from "./entities/event.entity";
export type {
  Report,
  ReportInsert,
  ReportUpdate,
} from "./entities/report.entity";
export {
  ReportReason,
  ReportSelect,
  ReportStatus,
} from "./entities/report.entity";
export type { User } from "./entities/user.entity";
// Types
export * from "./types";
export {
  generateRandomNickname,
  isValidNickname,
} from "./utils/generate-nickname.util";
// Utils
export { generateId } from "./utils/uuid";
