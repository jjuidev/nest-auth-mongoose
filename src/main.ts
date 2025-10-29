import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/app/app.module';

const bootstrap = async () => {
	const app = await NestFactory.create(AppModule);

	app.listen(process.env.PORT ?? 3000, () => {
		console.log(`Server is running on ${process.env.HOST ?? 'localhost'}:${process.env.PORT ?? 3000}`);
	});
};

bootstrap();
