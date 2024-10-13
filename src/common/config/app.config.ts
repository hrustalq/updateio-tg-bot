interface AppConfig {
  port: number;
  host: string;
  apiPrefix: string;
  cors: {
    origin: string;
    methods: string;
    allowedHeaders: string;
    credentials: boolean;
    preflightContinue: boolean;
    optionsSuccessStatus: number;
  };
}

export const appConfig: AppConfig = {
  port: process.env.TELEGRAM_BOT_PORT
    ? parseInt(process.env.TELEGRAM_BOT_PORT, 10)
    : 3000,
  host: process.env.TELEGRAM_BOT_HOST || '0.0.0.0',
  apiPrefix: process.env.TELEGRAM_BOT_API_PREFIX || 'api',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      process.env.CORS_ALLOWED_HEADERS || 'Content-Type, Accept, Authorization',
    credentials: process.env.CORS_CREDENTIALS
      ? process.env.CORS_CREDENTIALS === 'true'
      : true,
    preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE
      ? process.env.CORS_PREFLIGHT_CONTINUE === 'true'
      : false,
    optionsSuccessStatus: process.env.CORS_OPTIONS_SUCCESS_STATUS
      ? parseInt(process.env.CORS_OPTIONS_SUCCESS_STATUS, 10)
      : 204,
  },
};

export const allowedOrigins = process.env.CORS_ORIGIN.split(',');
