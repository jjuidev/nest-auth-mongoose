import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@/core/database/repositories/base.repository';
import { User } from '@/modules/users/schemas/user.schema';

@Injectable()
export class UserRepository extends BaseRepository<User> {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
		super(userModel);
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.findOne({ email: email.toLowerCase() });
	}

	async findByEmailWithPassword(email: string): Promise<User | null> {
		return this.model.findOne({ email: email.toLowerCase() }).select('+password').exec();
	}

	async findActiveUsers(): Promise<User[]> {
		return this.findAll({ isActive: true }, undefined, { sort: { createdAt: -1 } });
	}

	async updateLastLogin(userId: string): Promise<User | null> {
		return this.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
	}

	async deactivateUser(userId: string): Promise<User | null> {
		return this.findByIdAndUpdate(userId, { isActive: false });
	}

	async countActiveUsers(): Promise<number> {
		return this.count({ isActive: true });
	}
}
