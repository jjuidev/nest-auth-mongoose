import { Document, FilterQuery, Model, ProjectionType, QueryOptions, UpdateQuery } from 'mongoose';

import { IRepository } from '@/core/database/interfaces/repository.interface';
import { PaginatedResult, PaginationOptions } from '@/core/database/interfaces/pagination.interface';

export abstract class BaseRepository<T extends Document> implements IRepository<T> {
	constructor(protected readonly model: Model<T>) {}

	async create(data: Partial<T>): Promise<T> {
		const entity = new this.model(data);

		return entity.save();
	}

	async createMany(data: Partial<T>[]): Promise<T[]> {
		return this.model.insertMany(data) as unknown as Promise<T[]>;
	}

	async findById(id: string, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null> {
		return this.model.findById(id, projection, options).exec();
	}

	async findOne(filter: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null> {
		return this.model.findOne(filter, projection, options).exec();
	}

	async findAll(filter: FilterQuery<T> = {}, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T[]> {
		return this.model.find(filter, projection, options).exec();
	}

	async findByIdAndUpdate(id: string, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
		return this.model
			.findByIdAndUpdate(id, update, {
				new: true,
				...options,
			})
			.exec();
	}

	async findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
		return this.model
			.findOneAndUpdate(filter, update, {
				new: true,
				...options,
			})
			.exec();
	}

	async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<number> {
		const result = await this.model.updateMany(filter, update, options as any).exec();

		return result.modifiedCount;
	}

	async findByIdAndDelete(id: string, options?: QueryOptions<T>): Promise<T | null> {
		return this.model.findByIdAndDelete(id, options).exec();
	}

	async findOneAndDelete(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
		return this.model.findOneAndDelete(filter, options).exec();
	}

	async deleteMany(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<number> {
		const result = await this.model.deleteMany(filter, options as any).exec();

		return result.deletedCount;
	}

	async count(filter: FilterQuery<T> = {}): Promise<number> {
		return this.model.countDocuments(filter).exec();
	}

	async exists(filter: FilterQuery<T>): Promise<boolean> {
		const count = await this.model.countDocuments(filter).limit(1).exec();

		return count > 0;
	}

	async findAllPaginated(
		filter: FilterQuery<T> = {},
		options: PaginationOptions,
		projection?: ProjectionType<T>,
	): Promise<PaginatedResult<T>> {
		const { page, limit, sort } = options;
		const skip = (page - 1) * limit;

		const queryOptions: QueryOptions<T> = {
			skip,
			limit,
			sort: sort || { createdAt: -1 },
		};

		const [data, total] = await Promise.all([
			this.findAll(filter, projection, queryOptions),
			this.count(filter),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			data,
			meta: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			},
		};
	}
}
