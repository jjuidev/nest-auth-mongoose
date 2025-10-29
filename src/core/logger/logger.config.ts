import { z } from 'zod';

export const loggerConfigSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type LoggerConfig = z.infer<typeof loggerConfigSchema>;
