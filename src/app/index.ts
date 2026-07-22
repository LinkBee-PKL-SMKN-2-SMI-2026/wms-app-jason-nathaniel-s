// Import Used Package
import express from 'express';
import { logger } from '../utils/logger';
import pinoHttp from 'pino-http';
import routes from '../routes/index';
import { errorHandler } from '../middlewares/errorHandler.middleware';

// Inisialisasi App
const app = express();
const PORT = process.env.PORT;

// Register Middleware
app.use(express.json()); // Default: Jangan dihapus
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void => {
    // Cek apakah errornya adalah SyntaxError dari body-parser (express.json)
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
      logger.warn(
        { event: 'JSON_PARSE_ERROR', error: err.message },
        'Menerima format JSON yang tidak valid',
      );

      res.status(400).json({
        success: false,
        message: 'Format data JSON tidak valid.',
        error: err.message, // Opsional: kasih tahu error spesifiknya apa
      });
      return; // Berhenti di sini, jangan lanjut ke route
    }

    // Kalau errornya bukan masalah JSON, lempar ke errorHandler bawaanmu
    next(err);
  },
);
app.use(pinoHttp({ logger })); // Default: Jangan dihapus

// Register Routes
app.use('/api', routes);

// Middleware Handle Error
app.use(errorHandler); // Default: Jangan dihapus

const server = app.listen(PORT, () => {
  const address = server.address();
  const actualPort = typeof address === 'string' ? address : address?.port;

  logger.info(
    { event: 'SERVER_START', port: actualPort },
    `Server berjalan di http://localhost:${actualPort}`,
  );
});
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.fatal({ event: 'PORT_CLASH', port: PORT }, `Port ${PORT} sudah digunakan aplikasi lain`);
    process.exit(1); // Paksa matiin biar ga jalan diem-diem
  }
});
