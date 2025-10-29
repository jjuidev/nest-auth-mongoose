import { Global, Module } from '@nestjs/common';

import { ConfigModule } from '@/core/config/config.module';
import { DatabaseModule } from '@/core/database/database.module';
import { LoggerModule } from '@/core/logger/logger.module';

@Global()
@Module({
	imports: [ConfigModule, LoggerModule, DatabaseModule],
	providers: [],
	exports: [LoggerModule],
})
export class CoreModule {}
