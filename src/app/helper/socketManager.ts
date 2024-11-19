import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

export default class SocketManager {
  private static io: Server | null = null;

  // Initialize the Socket.IO instance
  public static initialize(httpServer: HTTPServer): Server {
    if (!this.io) {
      this.io = new Server(httpServer, {
        cors: {
          origin: '*',
        },
      });
      console.log('Socket.IO initialized');
    }
    return this.io;
  }

  // Get the Socket.IO instance
  public static getInstance(): Server {
    if (!this.io) {
      throw new Error('Socket.IO instance is not initialized. Call initialize() first.');
    }
    return this.io;
  }
}
