import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import { Config } from '@/core/config/config';

@Injectable()
export class ConfigService {
	constructor(private configService: NestConfigService<Config, true>) {}

	get<T extends keyof Config>(key: T) {
		return this.configService.get<Config[T]>(key);
	}
}
