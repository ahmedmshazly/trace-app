import { z } from 'zod';

/**
 * Single, validated configuration surface (Constitution V/VI; research R-10).
 * All environment access flows through here. The process fails fast at startup
 * if required configuration is missing or invalid — no silent insecure defaults.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
});

export type AppConfig = Readonly<{
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  allowedOrigins: string[];
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
  rateLimit: { windowMs: number; max: number };
  isProduction: boolean;
  isTest: boolean;
}>;

function buildConfig(source: NodeJS.ProcessEnv): AppConfig {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid configuration. Fix the environment and restart:\n${issues}`);
  }

  const env = parsed.data;
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  // On Vercel, preview and production URLs are injected at runtime — allow them
  // automatically so CORS works without listing every deployment URL.
  for (const key of ['VERCEL_URL', 'VERCEL_BRANCH_URL'] as const) {
    const host = source[key];
    if (host) {
      allowedOrigins.push(`https://${host}`);
    }
  }

  return Object.freeze({
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    mongodbUri: env.MONGODB_URI,
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    allowedOrigins: [...new Set(allowedOrigins)],
    logLevel: env.LOG_LEVEL,
    rateLimit: { windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX },
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  });
}

export const config: AppConfig = buildConfig(process.env);
