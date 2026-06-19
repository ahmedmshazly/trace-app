/**
 * Global test environment. Runs before any test module imports `src/*`, so the
 * validated config (which reads process.env at import) has all required values.
 * The real datastore URI is provided per-suite by an in-memory Mongo server.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-16-chars-long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/trace_test_placeholder';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';
process.env.LOG_LEVEL = 'silent';
