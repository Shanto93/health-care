type ISortOrder = "asc" | "desc";

export interface IPaginationOptions {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: ISortOrder;
}

export interface IPaginationResult {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: ISortOrder;
}

const calculatePagination = (
  options: IPaginationOptions,
): IPaginationResult => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;

  const skip = (page - 1) * limit;
  const take = limit;

  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export const paginationHelper = {
  calculatePagination,
};
