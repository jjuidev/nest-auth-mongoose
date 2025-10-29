import { z } from 'zod';

export const configSchema = z.object({
	// App
	HOST: z.string().default('http://localhost'),
	PORT: z
		.string()
		.transform((value) => Number(value))
		.default(3000),
	API_PREFIX: z.string().default('api'),
});

export type Config = z.infer<typeof configSchema>;
