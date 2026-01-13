export declare class PaginationDto {
    page?: number;
    limit?: number;
    get offset(): number;
}
export declare class PaginatedResponseDto<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    constructor(data: T[], total: number, page: number, limit: number);
}
