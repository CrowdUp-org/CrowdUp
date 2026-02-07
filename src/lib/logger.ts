/**
 * Structured Logger
 *
 * Provides environment-aware logging with structured metadata.
 * - Development: All logs output to console
 * - Production: Only errors logged (extend for external services)
 *
 * SECURITY: Never log sensitive data (passwords, tokens, PII).
 */

const isDev = process.env.NODE_ENV !== "production";

/**
 * Redacts sensitive fields from metadata objects.
 * Use this when logging request bodies or user data.
 *
 * @param obj - Object to redact
 * @returns Object with sensitive fields replaced
 */
export function redactSensitive(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveKeys = [
    "password",
    "passwordHash",
    "token",
    "accessToken",
    "refreshToken",
    "secret",
    "apiKey",
    "authorization",
    "cookie",
    "creditCard",
    "ssn",
  ];

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sk) => lowerKey.includes(sk.toLowerCase()))) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactSensitive(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Formats log message with timestamp and metadata.
 */
function formatMessage(
  level: string,
  message: string,
  meta?: Record<string, unknown>,
): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

/**
 * Structured logger with environment-aware output.
 *
 * @example
 * ```typescript
 * logger.info('User logged in', { userId: user.id });
 * logger.error('Database query failed', error, { query: 'SELECT...' });
 * logger.debug('Processing request', { path: req.url });
 * ```
 */
export const logger = {
  /**
   * Logs informational messages.
   * Only outputs in development.
   */
  info: (message: string, meta?: Record<string, unknown>): void => {
    if (isDev) {
      console.log(formatMessage("INFO", message, meta));
    }
  },

  /**
   * Logs warning messages.
   * Only outputs in development.
   */
  warn: (message: string, meta?: Record<string, unknown>): void => {
    if (isDev) {
      console.warn(formatMessage("WARN", message, meta));
    }
  },

  /**
   * Logs error messages.
   * Always outputs (production and development).
   * In production, extend this to send to error tracking (e.g., Sentry).
   *
   * @param message - Error description
   * @param error - Optional Error object
   * @param meta - Optional metadata (will be redacted for sensitive fields)
   */
  error: (
    message: string,
    error?: Error | unknown,
    meta?: Record<string, unknown>,
  ): void => {
    const errorMeta: Record<string, unknown> = {
      ...(meta ? redactSensitive(meta) : {}),
    };

    if (error instanceof Error) {
      errorMeta.errorMessage = error.message;
      errorMeta.errorName = error.name;
      // In production, avoid logging stack traces to console
      // but capture them for error tracking services
      if (isDev) {
        errorMeta.stack = error.stack;
      }
    } else if (error !== undefined) {
      errorMeta.error = String(error);
    }

    console.error(formatMessage("ERROR", message, errorMeta));

    // TODO: In production, send to error tracking service
    // if (!isDev && error instanceof Error) {
    //   Sentry.captureException(error, { extra: meta });
    // }
  },

  /**
   * Logs debug messages.
   * Only outputs in development.
   */
  debug: (message: string, meta?: Record<string, unknown>): void => {
    if (isDev) {
      console.debug(formatMessage("DEBUG", message, meta));
    }
  },

  /**
   * Logs API request/response for debugging.
   * Only outputs in development. Redacts sensitive fields.
   */
  api: (
    method: string,
    path: string,
    status: number,
    meta?: Record<string, unknown>,
  ): void => {
    if (isDev) {
      const logMeta = {
        method,
        path,
        status,
        ...(meta ? redactSensitive(meta) : {}),
      };
      console.log(formatMessage("API", `${method} ${path} ${status}`, logMeta));
    }
  },
};

export default logger;
