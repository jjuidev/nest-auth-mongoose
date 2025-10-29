import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule, PinoLogger } from 'nestjs-pino';

import { ConfigModule } from '@/core/config/config.module';
import { ConfigService } from '@/core/config/config.service';
import { LoggerService } from '@/core/logger/logger.service';

export const BOOTSTRAP_LOGGER = 'BOOTSTRAP_LOGGER';

@Module({
	imports: [
		PinoLoggerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				return {
					pinoHttp: {
						level: configService.get('LOG_LEVEL'),
						transport:
							configService.get('NODE_ENV') !== 'production'
								? {
										target: 'pino-pretty',
										options: {
											colorize: true,
											levelFirst: true,
											translateTime: 'dd/mm/yy HH:MM:ss.l',
											ignore: 'pid,hostname,context',
											singleLine: true,
											messageFormat: '[{context}] {msg}',
										},
									}
								: undefined,
						serializers: {
							req: (req) => ({
								id: req.id,
								method: req.method,
								url: req.url,
							}),
							res: (res) => ({
								statusCode: res.statusCode,
							}),
						},
						autoLogging: {
							ignore: (req) => req.url === '/health' || req.url === '/metrics',
						},
						customProps: () => ({
							context: 'HTTP',
						}),
					},
				};
			},
		}),
	],
	providers: [
		LoggerService,
		{
			provide: BOOTSTRAP_LOGGER,
			useFactory: (pinoLogger: PinoLogger) => {
				return LoggerService.create(pinoLogger, 'Bootstrap');
			},
			inject: [PinoLogger],
		},
	],
	exports: [LoggerService, BOOTSTRAP_LOGGER],
})
export class LoggerModule {}
