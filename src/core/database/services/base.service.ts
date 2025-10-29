import { Document, FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from 'mongoose';

import { IRepository } from '@/core/database/interfaces/repository.interface';

export abstract class BaseService<T extends Document> {
	constructor(protected readonly repository: IRepository<T>) {}

	async create(data: Partial<T>): Promise<T> {
		return this.repository.create(data);
	}

	async createMany(data: Partial<T>[]): Promise<T[]> {
		return this.repository.createMany(data);
	}

	async findById(id: string, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null> {
		return this.repository.findById(id, projection, options);
	}

	async findOne(filter: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null> {
		return this.repository.findOne(filter, projection, options);
	}

	async findAll(filter?: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T[]> {
		return this.repository.findAll(filter, projection, options);
	}

	async findByIdAndUpdate(id: string, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
		return this.repository.findByIdAndUpdate(id, update, options);
	}

	async findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
		return this.repository.findOneAndUpdate(filter, update, options);
	}

	async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<number> {
		return this.repository.updateMany(filter, update, options);
	}

	async findByIdAndDelete(id: string, options?: QueryOptions<T>): Promise<T | null> {
		return this.repository.findByIdAndDelete(id, options);
	}

	async findOneAndDelete(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
		return this.repository.findOneAndDelete(filter, options);
	}

	async deleteMany(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<number> {
		return this.repository.deleteMany(filter, options);
	}

	async count(filter?: FilterQuery<T>): Promise<number> {
		return this.repository.count(filter);
	}

	async exists(filter: FilterQuery<T>): Promise<boolean> {
		return this.repository.exists(filter);
	}
}
