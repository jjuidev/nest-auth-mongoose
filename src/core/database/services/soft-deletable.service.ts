import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';

import { BaseService } from './base.service';
import { SoftDeletableEntity } from '../entities/soft-deletable.entity';
import { SoftDeletableRepository } from '../repositories/soft-deletable.repository';
import { PaginatedResult, PaginationOptions } from '../interfaces/pagination.interface';

export abstract class SoftDeletableService<T extends SoftDeletableEntity> extends BaseService<T> {
	constructor(protected readonly repository: SoftDeletableRepository<T>) {
		super(repository);
	}

	async softDelete(id: string, deletedBy?: string): Promise<T | null> {
		return this.repository.softDelete(id, deletedBy);
	}

	async softDeleteMany(filter: FilterQuery<T>, deletedBy?: string): Promise<number> {
		return this.repository.softDeleteMany(filter, deletedBy);
	}

	async restore(id: string): Promise<T | null> {
		return this.repository.restore(id);
	}

	async restoreMany(filter: FilterQuery<T>): Promise<number> {
		return this.repository.restoreMany(filter);
	}

	async forceDelete(id: string): Promise<T | null> {
		return this.repository.forceDelete(id);
	}

	async forceDeleteMany(filter: FilterQuery<T>): Promise<number> {
		return this.repository.forceDeleteMany(filter);
	}

	async findAllWithDeleted(
		filter?: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Promise<T[]> {
		return this.repository.findAllWithDeleted(filter, projection, options);
	}

	async findAllOnlyDeleted(
		filter?: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Promise<T[]> {
		return this.repository.findAllOnlyDeleted(filter, projection, options);
	}

	async countWithDeleted(filter?: FilterQuery<T>): Promise<number> {
		return this.repository.countWithDeleted(filter);
	}

	async countOnlyDeleted(filter?: FilterQuery<T>): Promise<number> {
		return this.repository.countOnlyDeleted(filter);
	}

	async existsWithDeleted(filter: FilterQuery<T>): Promise<boolean> {
		return this.repository.existsWithDeleted(filter);
	}

	async findAllPaginated(
		filter: FilterQuery<T>,
		options: PaginationOptions,
		projection?: ProjectionType<T>,
	): Promise<PaginatedResult<T>> {
		return this.repository.findAllPaginated(filter, options, projection);
	}

	async findAllPaginatedWithDeleted(
		filter: FilterQuery<T>,
		options: PaginationOptions,
		projection?: ProjectionType<T>,
	): Promise<PaginatedResult<T>> {
		return this.repository.findAllPaginatedWithDeleted(filter, options, projection);
	}

	async findAllPaginatedOnlyDeleted(
		filter: FilterQuery<T>,
		options: PaginationOptions,
		projection?: ProjectionType<T>,
	): Promise<PaginatedResult<T>> {
		return this.repository.findAllPaginatedOnlyDeleted(filter, options, projection);
	}
}
