import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from '@/app/app.module';
import { CORS_OPTIONS } from '@/app/constants/app.constant';
import { ConfigService } from '@/core/config/config.service';
import { BOOTSTRAP_LOGGER } from '@/core/logger/logger.module';
import { LoggerService } from '@/core/logger/logger.service';

const bootstrap = async () => {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });

	const configService = app.get(ConfigService);
	const loggerService = app.get<LoggerService>(BOOTSTRAP_LOGGER);

	app.useLogger(loggerService);

	const port = configService.get('PORT');
	const host = configService.get('HOST');
	const apiPrefix = configService.get('API_PREFIX');

	app.enableCors(CORS_OPTIONS);
	app.setGlobalPrefix(apiPrefix);

	app.use(helmet());
	app.use(compression());

	await app.listen(port, () => {
		loggerService.log(`Server is running on ${host}:${port}/${apiPrefix}`);
	});
};

bootstrap();
