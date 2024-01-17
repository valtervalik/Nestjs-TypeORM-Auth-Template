import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

export interface IBaseService<M> {
  create(createDto: Params, activeUser?: ActiveUserData): Promise<M>;

  createIfUnique(
    conditions: Params,
    dto: Params,
    activeUser?: ActiveUserData,
  ): Promise<M>;

  findAll(
    conditions: Params,
    pagination: Pagination,
  ): Promise<{ elements: M[]; pagination: PaginationResult }>;

  findAllWithoutPagination(
    conditions: Params,
  ): Promise<{ elements: M[]; total: number }>;

  findById(id: number): Promise<M>;

  findOne(conditions: Params): Promise<M>;

  exists(conditions: Params): Promise<boolean>;

  update(
    id: number,
    updateDto: Params,
    activeUser?: ActiveUserData,
  ): Promise<M>;

  updateMany(
    ids: number[],
    conditions: Params,
    activeUser?: ActiveUserData,
  ): Promise<any>;

  remove(id: number, activeUser?: ActiveUserData): Promise<any>;

  removeMany(ids: number[], activeUser?: ActiveUserData): Promise<any>;

  restore(id: number, activeUser?: ActiveUserData): Promise<any>;

  restoreMany(ids: number[], activeUser?: ActiveUserData): Promise<any>;

  count(conditions?: Params): Promise<number>;
}

export interface Pagination {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  totalElements: number;
  hasNextPage: boolean;
  nextPage: number;
  previousPage: number;
  lastPage: number;
}

export interface Params {
  [key: string]: any;
}

export const DEFAULT_PAGINATION: Pagination = { page: 1, limit: 10 };
