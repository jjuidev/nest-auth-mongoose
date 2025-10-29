import { z } from 'zod';

export const configSchema = z.object({
	// App
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	HOST: z.string().default('http://localhost'),
	PORT: z
		.string()
		.transform((value) => Number(value))
		.default(3000),
	API_PREFIX: z.string().default('api'),

	// Logger
	LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

	// Database
	DATABASE_MONGODB_URI: z.string().default('mongodb://localhost:27017'),
});

export type Config = z.infer<typeof configSchema>;
