import { Injectable } from '@nestjs/common';

import { AuditableService, PaginatedResult, PaginationOptions } from '@/core/database';
import { InjectLogger } from '@/core/logger/decorators/inject-logger.decorator';
import { LoggerService } from '@/core/logger/logger.service';

import { UserRepository } from '../repositories/user.repository';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserService extends AuditableService<User> {
	@InjectLogger()
	private readonly logger: LoggerService;

	constructor(private readonly userRepository: UserRepository) {
		super(userRepository);
	}

	async createUser(email: string, name: string, password: string, createdBy?: string): Promise<User> {
		this.logger.log(`Creating user: ${email}`);

		const existingUser = await this.userRepository.findByEmail(email);

		if (existingUser) {
			this.logger.warn(`User already exists: ${email}`);
			throw new Error('User already exists');
		}

		const user = await this.createWithAudit(
			{
				email,
				name,
				password,
			},
			createdBy,
		);

		this.logger.log(`User created successfully: ${user.id}`);
		return user;
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userRepository.findByEmail(email);
	}

	async findByEmailWithPassword(email: string): Promise<User | null> {
		return this.userRepository.findByEmailWithPassword(email);
	}

	async updateProfile(userId: string, name: string, updatedBy?: string): Promise<User | null> {
		this.logger.log(`Updating user profile: ${userId}`);
		return this.findByIdAndUpdateWithAudit(userId, { name }, updatedBy);
	}

	async recordLogin(userId: string): Promise<User | null> {
		this.logger.debug(`Recording login for user: ${userId}`);
		return this.userRepository.updateLastLogin(userId);
	}

	async deactivateUser(userId: string): Promise<User | null> {
		this.logger.warn(`Deactivating user: ${userId}`);
		return this.userRepository.deactivateUser(userId);
	}

	async getActiveUsers(): Promise<User[]> {
		return this.userRepository.findActiveUsers();
	}

	async getUserStats(): Promise<{ total: number; active: number; deleted: number }> {
		const [total, active, deleted] = await Promise.all([
			this.userRepository.count(),
			this.userRepository.countActiveUsers(),
			this.userRepository.countOnlyDeleted(),
		]);

		return { total, active, deleted };
	}

	async getUsersPaginated(options: PaginationOptions): Promise<PaginatedResult<User>> {
		return this.userRepository.findAllPaginated({ isActive: true }, options);
	}

	async softDeleteUser(userId: string, deletedBy?: string): Promise<User | null> {
		this.logger.warn(`Soft deleting user: ${userId}`);
		return this.softDelete(userId, deletedBy);
	}

	async restoreUser(userId: string): Promise<User | null> {
		this.logger.log(`Restoring user: ${userId}`);
		return this.restore(userId);
	}

	async getDeletedUsers(): Promise<User[]> {
		return this.findAllOnlyDeleted();
	}
}
