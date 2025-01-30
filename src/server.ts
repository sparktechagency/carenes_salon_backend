/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */
import mongoose from 'mongoose';
import { Server as HTTPServer } from 'http'; // Import HTTPServer type
import server from './app';
import { errorLogger, logger } from './app/shared/logger';
import config from './app/config';
import seedSuperAdmin from './app/DB';
import { initializeSocket } from './app/socket/socketManager';

let myServer: HTTPServer | undefined;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info('DB Connected Successfully');

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);
    myServer = server.listen(port, config.base_url as string, () => {
      logger.info(
        `Example app listening on port http://192.168.10.153:${config.port}`,
      );
      seedSuperAdmin();
    });

    // Initialize Socket.IO
    initializeSocket(myServer);
  } catch (error) {
    errorLogger.error('Error in main function:', error);
    throw error;
  }
}

main().catch((err) => errorLogger.error('Main function error:', err));

process.on('unhandledRejection', (promise, reason) => {
  console.log('unhandledRejection is detected shutting down the server');
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (myServer) {
    myServer.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', (promise, reason) => {
  console.log('uncaughtException is detected ');
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
