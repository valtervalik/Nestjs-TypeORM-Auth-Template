import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { Repository } from 'typeorm';

export interface IBaseService<M> {
  genericRepository: Repository<M>;

  create(createDto: Params, activeUser?: ActiveUserData): Promise<M>;

  createIfUnique(
    conditions: Params,
    dto: Params,
    activeUser?: ActiveUserData,
  ): Promise<M>;

  findAll(
    conditions: Params,
    pagination: Pagination,
    smartSearch?: Params,
  ): Promise<{ elements: M[]; pagination: PaginationResult }>;

  findAllWithoutPagination(
    conditions: Params,
    smartSearch?: Params,
  ): Promise<{ elements: M[]; total: number }>;

  findById(id: number): Promise<M>;

  findOne(conditions: Params): Promise<M>;

  exists(conditions: Params): Promise<boolean>;

  update(
    id: number,
    updateDto: Params,
    opt: CustomUpdateOptions,
    activeUser?: ActiveUserData,
  ): Promise<M>;

  updateMany(
    ids: number[],
    conditions: Params,
    opt: CustomUpdateOptions,
    activeUser?: ActiveUserData,
  ): Promise<any>;

  remove(id: number): Promise<any>;

  removeMany(ids: number[]): Promise<any>;

  softRemove(id: number, activeUser?: ActiveUserData): Promise<any>;

  softRemoveMany(ids: number[], activeUser?: ActiveUserData): Promise<any>;

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

export interface CustomUpdateOptions {
  new: boolean;
}

export interface Params {
  [key: string]: any;
}

export const DEFAULT_PAGINATION: Pagination = { page: 1, limit: 10 };

export enum OrderDirections {
  ASC = 'ASC',
  DESC = 'DESC',
}
