import { FilterQuery, Model, ProjectionType, QueryOptions, UpdateQuery } from 'mongoose';

import { BaseRepository } from './base.repository';
import { SoftDeletableEntity } from '../entities/soft-deletable.entity';
import { PaginatedResult, PaginationOptions } from '../interfaces/pagination.interface';

export abstract class SoftDeletableRepository<T extends SoftDeletableEntity> extends BaseRepository<T> {
	constructor(protected readonly model: Model<T>) {
		super(model);
	}

	async softDelete(id: string, deletedBy?: string): Promise<T | null> {
		const update: UpdateQuery<T> = {
			deletedAt: new Date(),
		} as UpdateQuery<T>;

		if (deletedBy) {
			(update as any).deletedBy = deletedBy;
		}

		return this.findByIdAndUpdate(id, update);
	}

	async softDeleteMany(filter: FilterQuery<T>, deletedBy?: string): Promise<number> {
		const update: UpdateQuery<T> = {
			deletedAt: new Date(),
		} as UpdateQuery<T>;

		if (deletedBy) {
			(update as any).deletedBy = deletedBy;
		}

		return this.updateMany(filter, update);
	}

	async restore(id: string): Promise<T | null> {
		return this.findByIdAndUpdate(id, {
			deletedAt: null,
			deletedBy: null,
		} as UpdateQuery<T>);
	}

	async restoreMany(filter: FilterQuery<T>): Promise<number> {
		return this.updateMany(filter, {
			deletedAt: null,
			deletedBy: null,
		} as UpdateQuery<T>);
	}

	async forceDelete(id: string): Promise<T | null> {
		return this.findByIdAndDelete(id);
	}

	async forceDeleteMany(filter: FilterQuery<T>): Promise<number> {
		return this.deleteMany(filter);
	}

	async findAllWithDeleted(
		filter: FilterQuery<T> = {},
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Promise<T[]> {
		return super.findAll(filter, projection, options);
	}

	async findAllOnlyDeleted(
		filter: FilterQuery<T> = {},
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Promise<T[]> {
		return super.findAll(
			{ ...filter, deletedAt: { $ne: null } } as FilterQuery<T>,
			projection,
			options,
		);
	}

	async findAll(
		filter: FilterQuery<T> = {},
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Promise<T[]> {
		return super.findAll(
			{ ...filter, deletedAt: null } as FilterQuery<T>,
			projection,
			options,
		);
	}

	async findOne(
		filter: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Promise<T | null> {
		return super.findOne(
			{ ...filter, deletedAt: null } as FilterQuery<T>,
			projection,
			options,
		);
	}

	async findById(id: string, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null> {
		return super.findOne(
			{ _id: id, deletedAt: null } as FilterQuery<T>,
			projection,
			options,
		);
	}

	async count(filter: FilterQuery<T> = {}): Promise<number> {
		return super.count({ ...filter, deletedAt: null } as FilterQuery<T>);
	}

	async countWithDeleted(filter: FilterQuery<T> = {}): Promise<number> {
		return super.count(filter);
	}

	async countOnlyDeleted(filter: FilterQuery<T> = {}): Promise<number> {
		return super.count({ ...filter, deletedAt: { $ne: null } } as FilterQuery<T>);
	}

	async exists(filter: FilterQuery<T>): Promise<boolean> {
		return super.exists({ ...filter, deletedAt: null } as FilterQuery<T>);
	}

	async existsWithDeleted(filter: FilterQuery<T>): Promise<boolean> {
		return super.exists(filter);
	}

	async findAllPaginated(
		filter: FilterQuery<T> = {},
		options: PaginationOptions,
		projection?: ProjectionType<T>,
	): Promise<PaginatedResult<T>> {
		return super.findAllPaginated(
			{ ...filter, deletedAt: null } as FilterQuery<T>,
			options,
			projection,
		);
	}

	async findAllPaginatedWithDeleted(
		filter: FilterQuery<T> = {},
		options: PaginationOptions,
		projection?: ProjectionType<T>,
	): Promise<PaginatedResult<T>> {
		return super.findAllPaginated(filter, options, projection);
	}

	async findAllPaginatedOnlyDeleted(
		filter: FilterQuery<T> = {},
		options: PaginationOptions,
		projection?: ProjectionType<T>,
	): Promise<PaginatedResult<T>> {
		return super.findAllPaginated(
			{ ...filter, deletedAt: { $ne: null } } as FilterQuery<T>,
			options,
			projection,
		);
	}
}
