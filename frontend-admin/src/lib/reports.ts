import type { Report, ReportStatus } from "@shared/entities/report.entity";
import type { PaginatedResponse } from "../types/admin.types";
import { api } from "./api";

export const reportsApi = {
	getReports: async (page = 1, limit = 20): Promise<PaginatedResponse<Report>> => {
		return api.get<PaginatedResponse<Report>>(`/reports?page=${page}&limit=${limit}`);
	},
	updateStatus: async (id: string, status: ReportStatus): Promise<Report> => {
		return api.patch<Report>(`/reports/${id}/status`, { status });
	},
};
