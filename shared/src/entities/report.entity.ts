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

export const ReportSelect = {
  id: "id",
  reporterId: "reporter_id",
  reportedUserId: "reported_user_id",
  definitionId: "definition_id",
  reason: "reason",
  status: "status",
  description: "description",
  createdAt: "created_at",
  updatedAt: "updated_at",
  resolvedAt: "resolved_at",
} as const;

export type ReportInsert = {
  reporterId: string;
  reportedUserId: string;
  definitionId?: string | null;
  reason: ReportReason;
  description?: string | null;
};

export type ReportUpdate = Partial<Pick<Report, "status" | "resolvedAt">>;
