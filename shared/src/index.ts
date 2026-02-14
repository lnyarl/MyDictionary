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
// DTOs
export { PaginatedResponseDto, PaginationDto } from "./dto/pagination.dto";
export { SearchTermDto } from "./dto/term/search-term.dto";
export type { TermResponseDto } from "./dto/term/term-response.dto";
export type {
  BadgeEntity,
  BadgeWithProgress,
  UserBadgeEntity,
  UserBadgeProgressEntity,
} from "./entities/badge.entity";
export type { Definition } from "./entities/definition.entity";
export {
  DefinitionSelect,
  OnlyDefinitionSelect,
} from "./entities/definition.entity";
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
export type { Term } from "./entities/term.entity";
export { TermSelect } from "./entities/term.entity";
export type { User } from "./entities/user.entity";
// Types
export * from "./types";
export {
  generateRandomNickname,
  isValidNickname,
} from "./utils/generate-nickname.util";
// Utils
export { generateId } from "./utils/uuid";
