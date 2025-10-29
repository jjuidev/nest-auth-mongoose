export interface PaginationOptions {
	page: number;
	limit: number;
	sort?: Record<string, 1 | -1>;
}

export interface PaginatedResult<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
}
