import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const logFilePath = process.env.LOG_FILE_PATH || './app.log';

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      options: { colorize: true },
    },
    {
      target: 'pino/file',
      options: { destination: logFilePath, mkdir: true },
    },
  ],
});

export const logger = pino(
  {
    level: 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);
