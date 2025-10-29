import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { configSchema } from '@/core/config/config';
import { ConfigService } from '@/core/config/config.service';

@Module({
	imports: [
		NestConfigModule.forRoot({
			envFilePath: process.env.NODE_ENV ? [`.env.${process.env.NODE_ENV}`] : ['.env'],
			validate: (env) => configSchema.parse(env),
			isGlobal: true,
		}),
	],
	providers: [ConfigService],
	exports: [ConfigService],
})
export class ConfigModule {}
