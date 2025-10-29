import { Injectable } from '@nestjs/common';

import { BaseService } from '@/core/database';
import { LoggerService } from '@/core/logger/logger.service';
import { InjectLogger } from '@/core/logger/decorators/inject-logger.decorator';

import { User } from '../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService extends BaseService<User> {
	@InjectLogger()
	private readonly logger: LoggerService;

	constructor(private readonly userRepository: UserRepository) {
		super(userRepository);
	}

	async createUser(email: string, name: string, password: string): Promise<User> {
		this.logger.log(`Creating user: ${email}`);

		const existingUser = await this.userRepository.findByEmail(email);
		if (existingUser) {
			this.logger.warn(`User already exists: ${email}`);
			throw new Error('User already exists');
		}

		const user = await this.userRepository.create({
			email,
			name,
			password,
		});

		this.logger.log(`User created successfully: ${user.id}`);
		return user;
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userRepository.findByEmail(email);
	}

	async findByEmailWithPassword(email: string): Promise<User | null> {
		return this.userRepository.findByEmailWithPassword(email);
	}

	async updateProfile(userId: string, name: string): Promise<User | null> {
		this.logger.log(`Updating user profile: ${userId}`);
		return this.userRepository.findByIdAndUpdate(userId, { name });
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

	async getUserStats(): Promise<{ total: number; active: number }> {
		const [total, active] = await Promise.all([this.count(), this.userRepository.countActiveUsers()]);

		return { total, active };
	}
}
