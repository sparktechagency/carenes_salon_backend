/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as IOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: IOServer | null = null;

const initializeSocket = (server: HTTPServer) => {
  if (!io) {
    io = new IOServer(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });

    io.on('connection', (socket: Socket) => {
      console.log('A user connected:', socket.id);

      // Example: Save user's socket connection for later use
      const userId = socket.handshake.query.id as string;
      socket.join(userId);

      socket.on('nice', (data: any) => {
        console.log('Data received on "nice" event:', data);
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
      });
    });
  }
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized. Call initializeSocket first.');
  }
  return io;
};

export { initializeSocket, getIO };
