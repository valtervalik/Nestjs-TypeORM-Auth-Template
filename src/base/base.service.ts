import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  CustomUpdateOptions,
  IBaseService,
  OrderDirections,
  Pagination,
  PaginationResult,
  Params,
} from './base-interfaces';

export function BaseService<T>(
  entityClass: EntityClassOrSchema,
): Type<IBaseService<T>> {
  @Injectable()
  class BaseServiceClass<T> implements IBaseService<T> {
    @InjectRepository(entityClass)
    public readonly genericRepository: Repository<T>;

    public async create(
      createDto: Params,
      activeUser?: ActiveUserData,
    ): Promise<T> {
      try {
        const queryBuilder = this.genericRepository.createQueryBuilder();
        const entity = activeUser
          ? {
              ...createDto,
              created_by: activeUser.sub,
            }
          : createDto;

        const saved = await queryBuilder
          .insert()
          .into(this.genericRepository.metadata.name)
          .values(entity)
          .returning('*')
          .execute();

        return saved.generatedMaps[0] as T;
      } catch (e) {
        if (e.code === '23505') {
          throw new ConflictException('Document already exists');
        }
        throw e;
      }
    }

    public async createIfUnique(
      conditions: Params,
      createDto: Params,
      activeUser?: ActiveUserData,
    ): Promise<T> {
      try {
        const queryBuilder = this.genericRepository.createQueryBuilder();
        const exists = await queryBuilder.select().where(conditions).getOne();

        if (exists) {
          throw new BadRequestException('Document already exists');
        }

        const entity = activeUser
          ? {
              ...createDto,
              created_by: activeUser.sub,
            }
          : createDto;

        const saved = await queryBuilder
          .insert()
          .into(this.genericRepository.metadata.name)
          .values(entity)
          .returning('*')
          .execute();

        return saved.generatedMaps[0] as T;
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }

    public async findAll(
      conditions: Params = {},
      pagination: Pagination = { page: 1, limit: 10 },
    ): Promise<{ elements: T[]; pagination: PaginationResult }> {
      try {
        const { page = 1, limit = 10 } = pagination;
        const skipCount = (page - 1) * limit;
        const order = conditions['order'] || 'created_at';
        const orderDirection =
          conditions['orderDirection'] || OrderDirections.ASC;
        const select = conditions['select'] || [];
        const relations = conditions['relations'] || [];
        const smartSearch = conditions['smartSearch'] || false;

        const where: Params = { ...conditions };
        delete where.order;
        delete where.orderDirection;
        delete where.relations;
        delete where.select;
        delete where.smartSearch;

        const queryBuilder =
          this.genericRepository.createQueryBuilder('entity');
        if (where.deleted) {
          queryBuilder.withDeleted();
          delete where.deleted;
        }

        if (smartSearch) {
          Object.keys(where).forEach((key: string) => {
            const value = where[key];
            const [relation, property] = key.split('.');
            if (property) {
              queryBuilder.orWhere(`${relation}.${property} ILIKE :value`, {
                value: `%${value}%`,
              });
            } else {
              queryBuilder.orWhere(`entity.${key} ILIKE :value`, {
                value: `%${value}%`,
              });
            }
          });
        } else {
          Object.keys(where).forEach((key: string) => {
            const value = where[key];
            const [relation, property] = key.split('.');
            if (property) {
              queryBuilder.andWhere(`${relation}.${property} = :value`, {
                value,
              });
            } else {
              queryBuilder.andWhere(`entity.${key} = :value`, { value });
            }
          });
        }

        queryBuilder
          .select(select.length > 0 ? select : null)
          .skip(skipCount)
          .take(limit)
          .orderBy(`entity.${order}`, orderDirection);

        if (relations.length > 0) {
          relations.forEach((relation: string) => {
            const nestedRelations = relation.split('.');
            if (nestedRelations.length > 1) {
              queryBuilder.leftJoinAndSelect(
                `entity.${nestedRelations[0]}`,
                nestedRelations[0],
              );
              queryBuilder.leftJoinAndSelect(
                `${nestedRelations[0]}.${nestedRelations[1]}`,
                nestedRelations[1],
              );
            } else {
              queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
            }
          });
        }

        const [elements, totalElements] = await queryBuilder.getManyAndCount();

        const hasNextPage = totalElements > page * limit;
        const nextPage = hasNextPage ? page + 1 : null;
        const previousPage = page > 1 ? page - 1 : null;
        const lastPage = Math.ceil(totalElements / limit);

        const paginationResult: PaginationResult = {
          totalElements,
          hasNextPage,
          nextPage,
          previousPage,
          lastPage,
        };

        return { elements, pagination: paginationResult };
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }

    public async findAllWithoutPagination(
      conditions: Params = {},
    ): Promise<{ elements: T[]; total: number }> {
      try {
        const order = conditions['order'] || 'created_at';
        const orderDirection =
          conditions['orderDirection'] || OrderDirections.ASC;
        const select = conditions['select'] || [];
        const relations = conditions['relations'] || [];
        const smartSearch = conditions['smartSearch'] || false;

        const where: Params = { ...conditions };
        delete where.order;
        delete where.orderDirection;
        delete where.relations;
        delete where.select;
        delete where.smartSearch;

        const queryBuilder =
          this.genericRepository.createQueryBuilder('entity');
        if (where.deleted) {
          queryBuilder.withDeleted();
          delete where.deleted;
        }

        if (smartSearch) {
          Object.keys(where).forEach((key: string) => {
            const value = where[key];
            const [relation, property] = key.split('.');
            if (property) {
              queryBuilder.orWhere(`${relation}.${property} ILIKE :value`, {
                value: `%${value}%`,
              });
            } else {
              queryBuilder.orWhere(`entity.${key} ILIKE :value`, {
                value: `%${value}%`,
              });
            }
          });
        } else {
          Object.keys(where).forEach((key: string) => {
            const value = where[key];
            const [relation, property] = key.split('.');
            if (property) {
              queryBuilder.andWhere(`${relation}.${property} = :value`, {
                value,
              });
            } else {
              queryBuilder.andWhere(`entity.${key} = :value`, { value });
            }
          });
        }

        queryBuilder
          .select(select.length > 0 ? select : null)
          .orderBy(`entity.${order}`, orderDirection);

        if (relations.length > 0) {
          relations.forEach((relation: string) => {
            const nestedRelations = relation.split('.');
            if (nestedRelations.length > 1) {
              queryBuilder.leftJoinAndSelect(
                `entity.${nestedRelations[0]}`,
                nestedRelations[0],
              );
              queryBuilder.leftJoinAndSelect(
                `${nestedRelations[0]}.${nestedRelations[1]}`,
                nestedRelations[1],
              );
            } else {
              queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
            }
          });
        }

        const elements = await queryBuilder.getMany();
        const total = await queryBuilder.getCount();

        return { elements, total };
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }

    public async findById(id: string): Promise<T> {
      try {
        const queryBuilder = this.genericRepository.createQueryBuilder();

        const data = await queryBuilder.where({ id }).getOne();

        if (!data)
          throw new NotFoundException(
            `Not found ${this.genericRepository.metadata.name} with id ${id}`,
          );

        return data;
      } catch (err) {
        throw err;
      }
    }

    public async findOne(conditions: Params): Promise<T> {
      try {
        const where: Params = { ...conditions };
        const relations = where.relations || [];
        const select = conditions['select'] || '';
        delete where.relations;
        delete where.select;

        const queryBuilder =
          this.genericRepository.createQueryBuilder('entity');
        if (where.deleted) {
          queryBuilder.withDeleted();
          delete where.deleted;
        }

        queryBuilder
          .select(
            select.length > 0 ? select.map((s: string) => `entity.${s}`) : null,
          )
          .where(where);

        if (relations.length > 0) {
          relations.forEach((relation: string) => {
            const nestedRelations = relation.split('.');
            if (nestedRelations.length > 1) {
              queryBuilder.leftJoinAndSelect(
                `entity.${nestedRelations[0]}`,
                nestedRelations[0],
              );
              queryBuilder.leftJoinAndSelect(
                `${nestedRelations[0]}.${nestedRelations[1]}`,
                nestedRelations[1],
              );
            } else {
              queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
            }
          });
        }

        const response = await queryBuilder.getOne();

        if (!response) {
          throw new NotFoundException(
            `Not found ${
              this.genericRepository.metadata.name
            } with conditions ${JSON.stringify(conditions)}`,
          );
        }

        return response;
      } catch (err) {
        throw err;
      }
    }

    public async exists(conditions: Params): Promise<boolean> {
      try {
        const where: Params = { ...conditions };

        const queryBuilder = this.genericRepository.createQueryBuilder();

        const count = await queryBuilder.where(where).getCount();

        return count > 0;
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }

    public async update(
      id: string,
      updateDto: Params,
      opt: CustomUpdateOptions,
      activeUser?: ActiveUserData,
    ): Promise<T | any> {
      try {
        const updateData = activeUser
          ? { ...updateDto, updated_by: activeUser.sub }
          : updateDto;

        const queryBuilder = this.genericRepository.createQueryBuilder();

        await queryBuilder
          .update()
          .set(updateData as QueryDeepPartialEntity<T>)
          .where('id = :id', { id })
          .execute();

        if (opt.new) {
          return await queryBuilder.where('id = :id', { id }).getOne();
        }
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }

    public async updateMany(
      ids: string[],
      conditions: Params,
      opt: CustomUpdateOptions,
      activeUser?: ActiveUserData,
    ): Promise<T[] | any> {
      try {
        const updateData = activeUser
          ? { ...conditions, updated_by: activeUser.sub }
          : conditions;

        const queryBuilder = this.genericRepository.createQueryBuilder();

        await queryBuilder
          .update()
          .set(updateData as QueryDeepPartialEntity<T>)
          .whereInIds(ids)
          .execute();

        if (opt.new) {
          return await queryBuilder.whereInIds(ids).getMany();
        }
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }

    public async remove(id: string): Promise<any> {
      try {
        const queryBuilder = this.genericRepository.createQueryBuilder();

        await queryBuilder
          .delete()
          .from(this.genericRepository.metadata.name)
          .where('id = :id', { id })
          .execute();
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }

    public async removeMany(ids: string[]): Promise<any> {
      try {
        const queryBuilder = this.genericRepository.createQueryBuilder();

        await queryBuilder
          .delete()
          .from(this.genericRepository.metadata.name)
          .whereInIds(ids)
          .execute();
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }

    public async softRemove(
      id: string,
      activeUser?: ActiveUserData,
    ): Promise<any> {
      try {
        const queryBuilder = this.genericRepository.createQueryBuilder();
        await queryBuilder.softDelete().where('id = :id', { id }).execute();
        await queryBuilder
          .update()
          .set({ restored_by: null, restored_at: null } as any)
          .where('id = :id', { id })
          .execute();

        if (activeUser) {
          await queryBuilder
            .update()
            .set({ deleted_by: activeUser.sub } as any)
            .where('id = :id', { id })
            .execute();
        }
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }
    public async softRemoveMany(
      ids: string[],
      activeUser?: ActiveUserData,
    ): Promise<any> {
      const queryBuilder = this.genericRepository.createQueryBuilder();

      await queryBuilder.softDelete().whereInIds(ids).execute();
      await queryBuilder
        .update()
        .set({ restored_by: null, restored_at: null } as any)
        .whereInIds(ids)
        .execute();

      if (activeUser) {
        await queryBuilder
          .update()
          .set({ deleted_by: activeUser.sub } as any)
          .whereInIds(ids)
          .execute();
      }
    }

    public async restore(
      id: string,
      activeUser?: ActiveUserData,
    ): Promise<any> {
      try {
        const queryBuilder = this.genericRepository.createQueryBuilder();

        await queryBuilder.restore().where('id = :id', { id }).execute();
        await queryBuilder
          .update()
          .set({ restored_at: new Date(), deleted_by: null } as any)
          .where('id = :id', { id })
          .execute();

        if (activeUser) {
          await queryBuilder
            .update()
            .set({ restored_by: activeUser.sub } as any)
            .where('id = :id', { id })
            .execute();
        }
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }

    public async restoreMany(
      ids: string[],
      activeUser?: ActiveUserData,
    ): Promise<any> {
      try {
        const queryBuilder = this.genericRepository.createQueryBuilder();

        await queryBuilder.restore().whereInIds(ids).execute();
        await queryBuilder
          .update()
          .set({ restored_at: new Date(), deleted_by: null } as any)
          .whereInIds(ids)
          .execute();

        if (activeUser) {
          await queryBuilder
            .update()
            .set({ restored_by: activeUser.sub } as any)
            .whereInIds(ids)
            .execute();
        }
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }

    public async count(conditions: Params = {}): Promise<number> {
      try {
        const where: Params = { ...conditions };

        const queryBuilder = this.genericRepository.createQueryBuilder();

        const count = await queryBuilder.where(where).getCount();

        return count;
      } catch (err) {
        throw new ConflictException(err.message);
      }
    }
  }

  return BaseServiceClass;
}
