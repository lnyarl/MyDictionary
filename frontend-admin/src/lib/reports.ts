import type {
	Report,
	ReportDetail,
	ReportStatus,
} from "@stashy/shared/entities/report.entity";
import type { PaginatedResponse } from "../types/admin.types";
import { api } from "./api";

export const reportsApi = {
	getReports: async (
		page = 1,
		limit = 20,
	): Promise<PaginatedResponse<Report>> => {
		return api.get<PaginatedResponse<Report>>(
			`/reports?page=${page}&limit=${limit}`,
		);
	},
	getReport: async (id: string): Promise<ReportDetail> => {
		return api.get<ReportDetail>(`/reports/${id}`);
	},
	updateStatus: async (id: string, status: ReportStatus): Promise<Report> => {
		return api.patch<Report>(`/reports/${id}/status`, { status });
	},
};
