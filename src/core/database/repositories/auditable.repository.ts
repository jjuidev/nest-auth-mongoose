import { FilterQuery, Model, UpdateQuery, QueryOptions } from 'mongoose';

import { SoftDeletableRepository } from './soft-deletable.repository';
import { AuditableEntity } from '../entities/auditable.entity';

export abstract class AuditableRepository<T extends AuditableEntity> extends SoftDeletableRepository<T> {
	constructor(protected readonly model: Model<T>) {
		super(model);
	}

	async createWithAudit(data: Partial<T>, createdBy?: string): Promise<T> {
		const entityData = { ...data } as any;

		if (createdBy) {
			entityData.createdBy = createdBy;
		}

		return super.create(entityData);
	}

	async createManyWithAudit(data: Partial<T>[], createdBy?: string): Promise<T[]> {
		if (createdBy) {
			const enrichedData = data.map((item) => ({
				...item,
				createdBy,
			})) as Partial<T>[];

			return super.createMany(enrichedData);
		}

		return super.createMany(data);
	}

	async findByIdAndUpdateWithAudit(
		id: string,
		update: UpdateQuery<T>,
		updatedBy?: string,
		options?: QueryOptions<T>,
	): Promise<T | null> {
		const enrichedUpdate = { ...update } as any;

		if (updatedBy) {
			enrichedUpdate.updatedBy = updatedBy;
		}

		return super.findByIdAndUpdate(id, enrichedUpdate, options);
	}

	async findOneAndUpdateWithAudit(
		filter: FilterQuery<T>,
		update: UpdateQuery<T>,
		updatedBy?: string,
		options?: QueryOptions<T>,
	): Promise<T | null> {
		const enrichedUpdate = { ...update } as any;

		if (updatedBy) {
			enrichedUpdate.updatedBy = updatedBy;
		}

		return super.findOneAndUpdate(filter, enrichedUpdate, options);
	}

	async updateManyWithAudit(
		filter: FilterQuery<T>,
		update: UpdateQuery<T>,
		updatedBy?: string,
		options?: QueryOptions<T>,
	): Promise<number> {
		const enrichedUpdate = { ...update } as any;

		if (updatedBy) {
			enrichedUpdate.updatedBy = updatedBy;
		}

		return super.updateMany(filter, enrichedUpdate, options);
	}
}
