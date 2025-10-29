import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserRepository } from '@/modules/users/repositories/user.repository';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';
import { UserService } from '@/modules/users/services/user.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
	],
	providers: [UserRepository, UserService],
	exports: [UserService],
})
export class UsersModule {}
