import type { ReportReason } from "@stashy/shared/entities/report.entity";
import { api } from "@/lib/api/api";

export interface CreateReportDto {
  reportedUserId: string;
  definitionId?: string;
  reason: ReportReason;
  description?: string;
}

export const reportsApi = {
  create: async (data: CreateReportDto) => {
    const response = await api.post<{ data: unknown }>("/reports", data);
    return response.data;
  },
};
