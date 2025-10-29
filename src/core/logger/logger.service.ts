import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
	private context?: string;

	constructor(private readonly pinoLogger: PinoLogger) {}

	static create(pinoLogger: PinoLogger, context: string): LoggerService {
		const logger = new LoggerService(pinoLogger);
		logger.setContext(context);
		return logger;
	}

	setContext(context: string): void {
		this.context = context;
	}

	log(message: string, ...optionalParams: unknown[]): void {
		this.pinoLogger.info({ context: this.context }, message, ...optionalParams);
	}

	error(message: string, trace?: string, ...optionalParams: unknown[]): void {
		if (trace) {
			this.pinoLogger.error(
				{
					context: this.context,
					trace,
				},
				message,
				...optionalParams,
			);
		} else {
			this.pinoLogger.error({ context: this.context }, message, ...optionalParams);
		}
	}

	warn(message: string, ...optionalParams: unknown[]): void {
		this.pinoLogger.warn({ context: this.context }, message, ...optionalParams);
	}

	debug(message: string, ...optionalParams: unknown[]): void {
		this.pinoLogger.debug({ context: this.context }, message, ...optionalParams);
	}

	verbose(message: string, ...optionalParams: unknown[]): void {
		this.pinoLogger.trace({ context: this.context }, message, ...optionalParams);
	}

	fatal(message: string, ...optionalParams: unknown[]): void {
		this.pinoLogger.fatal({ context: this.context }, message, ...optionalParams);
	}
}
