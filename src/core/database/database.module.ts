import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from '@/core/config/config.module';
import { ConfigService } from '@/core/config/config.service';

@Module({
	imports: [
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get('DATABASE_MONGODB_URI'),
				retryAttempts: 3,
				retryDelay: 1000,
			}),
		}),
	],
})
export class DatabaseModule {}
