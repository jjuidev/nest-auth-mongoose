import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from 'mongoose';

export interface IRepository<T> {
	create(data: Partial<T>): Promise<T>;
	createMany(data: Partial<T>[]): Promise<T[]>;

	findById(id: string, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null>;
	findOne(filter: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null>;
	findAll(filter?: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T[]>;

	findByIdAndUpdate(
		id: string,
		update: UpdateQuery<T>,
		options?: QueryOptions<T>,
	): Promise<T | null>;
	findOneAndUpdate(
		filter: FilterQuery<T>,
		update: UpdateQuery<T>,
		options?: QueryOptions<T>,
	): Promise<T | null>;
	updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<number>;

	findByIdAndDelete(id: string, options?: QueryOptions<T>): Promise<T | null>;
	findOneAndDelete(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<T | null>;
	deleteMany(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<number>;

	count(filter?: FilterQuery<T>): Promise<number>;
	exists(filter: FilterQuery<T>): Promise<boolean>;
}
