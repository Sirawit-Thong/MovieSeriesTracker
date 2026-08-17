type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL as LogLevel] ?? LOG_LEVELS.info;

function formatEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const context = entry.context ? ` [${entry.context}]` : '';
  const data = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
  return `${prefix}${context} ${entry.message}${data}`;
}

function createLogger(context?: string) {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      if (currentLevel > LOG_LEVELS.debug) return;
      console.debug(formatEntry({
        level: 'debug',
        message,
        context,
        data,
        timestamp: new Date().toISOString(),
      }));
    },

    info(message: string, data?: Record<string, unknown>) {
      if (currentLevel > LOG_LEVELS.info) return;
      console.info(formatEntry({
        level: 'info',
        message,
        context,
        data,
        timestamp: new Date().toISOString(),
      }));
    },

    warn(message: string, data?: Record<string, unknown>) {
      if (currentLevel > LOG_LEVELS.warn) return;
      console.warn(formatEntry({
        level: 'warn',
        message,
        context,
        data,
        timestamp: new Date().toISOString(),
      }));
    },

    error(message: string, error?: unknown, data?: Record<string, unknown>) {
      if (currentLevel > LOG_LEVELS.error) return;
      const errorData = error instanceof Error
        ? {name: error.name, message: error.message, stack: error.stack, ...data}
        : data;
      console.error(formatEntry({
        level: 'error',
        message,
        context,
        data: errorData,
        timestamp: new Date().toISOString(),
      }));
    },
  };
}

export {createLogger};
export type {LogLevel, LogEntry};
