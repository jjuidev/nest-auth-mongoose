import { Global, Module } from '@nestjs/common';

import { ConfigModule } from '@/core/config/config.module';
import { LoggerModule } from '@/core/logger/logger.module';

@Global()
@Module({
	imports: [ConfigModule, LoggerModule],
	providers: [],
	exports: [LoggerModule],
})
export class CoreModule {}
