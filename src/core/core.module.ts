import { Global, Module } from '@nestjs/common';

import { ConfigModule } from '@/core/config/config.module';

@Global()
@Module({
	imports: [ConfigModule],
	providers: [],
	exports: [],
})
export class CoreModule {}
