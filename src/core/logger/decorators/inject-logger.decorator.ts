import { Inject } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { LoggerService } from '../logger.service';

export const InjectLogger = (context?: string): PropertyDecorator => {
	const injectDecorator = Inject(PinoLogger);

	return (target: object, propertyKey: string | symbol) => {
		injectDecorator(target, propertyKey);

		const privatePropertyKey = Symbol(`__${String(propertyKey)}__`);

		Object.defineProperty(target, propertyKey, {
			get(this: any) {
				if (!this[privatePropertyKey]) {
					const pinoLogger: PinoLogger = this['pinoLogger'];
					if (!pinoLogger) {
						throw new Error(
							`PinoLogger not found. Make sure LoggerModule is imported and PinoLogger is available.`,
						);
					}

					const loggerContext = context || this.constructor.name;
					this[privatePropertyKey] = LoggerService.create(pinoLogger, loggerContext);
				}
				return this[privatePropertyKey];
			},
			enumerable: true,
			configurable: true,
		});
	};
};
