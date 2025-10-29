import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
	private context?: string;

	constructor(private readonly logger: Logger) {}

	setContext(context: string): void {
		this.context = context;
	}

	log(message: string, ...optionalParams: unknown[]): void {
		this.logger.log({ context: this.context }, message, ...optionalParams);
	}

	error(message: string, trace?: string, ...optionalParams: unknown[]): void {
		if (trace) {
			this.logger.error({ context: this.context, trace }, message, ...optionalParams);
		} else {
			this.logger.error({ context: this.context }, message, ...optionalParams);
		}
	}

	warn(message: string, ...optionalParams: unknown[]): void {
		this.logger.warn({ context: this.context }, message, ...optionalParams);
	}

	debug(message: string, ...optionalParams: unknown[]): void {
		this.logger.debug({ context: this.context }, message, ...optionalParams);
	}

	verbose(message: string, ...optionalParams: unknown[]): void {
		this.logger.log({ context: this.context, level: 'trace' }, message, ...optionalParams);
	}

	fatal(message: string, ...optionalParams: unknown[]): void {
		this.logger.fatal({ context: this.context }, message, ...optionalParams);
	}
}
