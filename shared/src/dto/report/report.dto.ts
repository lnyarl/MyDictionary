export enum ReportReason {
  SPAM = "SPAM",
  HARASSMENT = "HARASSMENT",
  HATE_SPEECH = "HATE_SPEECH",
  MISINFORMATION = "MISINFORMATION",
  INAPPROPRIATE = "INAPPROPRIATE",
  OTHER = "OTHER",
}

export enum ReportStatus {
  PENDING = "PENDING",
  REVIEWING = "REVIEWING",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
}

export interface ReportDto {
  id: string;
  reporterId: string;
  reportedUserId: string;
  definitionId: string | null;
  reason: ReportReason;
  status: ReportStatus;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
}

export interface ReportDetailDto extends ReportDto {
  reporterNickname: string;
  reportedNickname: string;
  reportedEmail: string;
  wordTerm: string;
  definitionContent: string;
  definitionMediaUrls: { url: string; type: string }[];
}

export type Report = ReportDto;
export type ReportDetail = ReportDetailDto;
