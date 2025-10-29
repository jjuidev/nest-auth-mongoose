import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from '@/app/app.module';
import { CORS_OPTIONS } from '@/app/constants/app.constant';
import { ConfigService } from '@/core/config/config.service';

const bootstrap = async () => {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });

	const logger = app.get(Logger);
	const configService = app.get(ConfigService);

	app.useLogger(logger);

	const port = configService.get('PORT');
	const host = configService.get('HOST');
	const apiPrefix = configService.get('API_PREFIX');

	app.enableCors(CORS_OPTIONS);
	app.setGlobalPrefix(apiPrefix);

	app.use(helmet());
	app.use(compression());

	app.listen(port, () => {
		logger.log(`Server is running on ${host}:${port}/${apiPrefix}`, 'Bootstrap');
	});
};

bootstrap();
