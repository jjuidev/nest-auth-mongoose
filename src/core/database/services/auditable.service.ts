import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';

import { SoftDeletableService } from './soft-deletable.service';
import { AuditableEntity } from '../entities/auditable.entity';
import { AuditableRepository } from '../repositories/auditable.repository';

export abstract class AuditableService<T extends AuditableEntity> extends SoftDeletableService<T> {
	constructor(protected readonly repository: AuditableRepository<T>) {
		super(repository);
	}

	async createWithAudit(data: Partial<T>, createdBy?: string): Promise<T> {
		return this.repository.createWithAudit(data, createdBy);
	}

	async createManyWithAudit(data: Partial<T>[], createdBy?: string): Promise<T[]> {
		return this.repository.createManyWithAudit(data, createdBy);
	}

	async findByIdAndUpdateWithAudit(
		id: string,
		update: UpdateQuery<T>,
		updatedBy?: string,
		options?: QueryOptions<T>,
	): Promise<T | null> {
		return this.repository.findByIdAndUpdateWithAudit(id, update, updatedBy, options);
	}

	async findOneAndUpdateWithAudit(
		filter: FilterQuery<T>,
		update: UpdateQuery<T>,
		updatedBy?: string,
		options?: QueryOptions<T>,
	): Promise<T | null> {
		return this.repository.findOneAndUpdateWithAudit(filter, update, updatedBy, options);
	}

	async updateManyWithAudit(
		filter: FilterQuery<T>,
		update: UpdateQuery<T>,
		updatedBy?: string,
		options?: QueryOptions<T>,
	): Promise<number> {
		return this.repository.updateManyWithAudit(filter, update, updatedBy, options);
	}
}
