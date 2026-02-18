import { ReportReason, ReportStatus } from "../dto/report/report.dto";

export { ReportReason, ReportStatus };

export type Report = {
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
};

export type ReportDetail = {
  reporterNickname: string;
  reportedNickname: string;
  reportedEmail: string;
  wordTerm: string;
  definitionContent: string;
  definitionMediaUrls: { url: string; type: string }[];
} & Report;

export type ReportInsert = {
  reporterId: string;
  reportedUserId: string;
  definitionId?: string | null;
  reason: ReportReason;
  description?: string | null;
};

export type ReportUpdate = Partial<Pick<Report, "status" | "resolvedAt">>;
