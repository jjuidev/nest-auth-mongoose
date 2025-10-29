import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { LoggerService } from '@/core/logger/logger.service';

@Module({
	imports: [
		PinoLoggerModule.forRoot({
			pinoHttp: {
				level: process.env.LOG_LEVEL || 'info',
				transport:
					process.env.NODE_ENV !== 'production'
						? {
								target: 'pino-pretty',
								options: {
									colorize: true,
									levelFirst: true,
									translateTime: 'yyyy-mm-dd HH:MM:ss.l',
									ignore: 'pid,hostname',
									singleLine: false,
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
		}),
	],
	providers: [LoggerService],
	exports: [LoggerService],
})
export class LoggerModule {}
