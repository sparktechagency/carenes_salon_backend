/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as IOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import getUserDetails from '../helper/getUserDetails';
import Conversation from '../modules/conversation/conversation.model';
import { getConversation } from '../helper/getConversation';
import Message from '../modules/message/message.model';
import { User } from '../modules/user/user.model';
// import { uploadFile } from '../helper/fileUploader';
// import util from 'util';
// import path from 'path';
// Promisify the upload middleware for use with Socket.IO
// const uploadMiddleware = util.promisify(uploadFile());
// let io: IOServer | null = null;
let io: IOServer;

const initializeSocket = (server: HTTPServer) => {
  if (!io) {
    io = new IOServer(server, {
      pingTimeout: 60000,
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:7585',
          'http://192.168.10.25:7585',
          'http://192.168.10.25:7585',
          'http://192.168.10.25:7586',
          'http://10.0.60.38:7585',
        ],
      },
    });
    // online user
    const onlineUser = new Set();
    io.on('connection', async (socket: Socket) => {
      const userId = socket.handshake.query.id as string;
      console.log('a user connected', userId);
      if (!userId) {
        return;
      }
      // const currentUser = await getUserDetails(userId);
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return;
      }
      const currentUserId = currentUser?._id.toString();
      // create a room-------------------------
      socket.join(currentUserId as string);
      // set online user
      onlineUser.add(currentUserId);
      // send to the client
      io.emit('onlineUser', Array.from(onlineUser));

      // message page-----------------
      socket.on('message-page', async (userId) => {
        const userDetails = await getUserDetails(userId);
        if (userDetails) {
          const payload = {
            _id: userDetails._id,
            name:
              userDetails.shopName ||
              userDetails.firstName + ' ' + userDetails.lastName,
            email: userDetails.email,
            profile_pic: userDetails.profile_image || userDetails.shopImages[0],
            online: onlineUser.has(userId),
          };
          socket.emit('message-user', payload);
        } else {
          console.log('User not found');
        }
        //get previous message
        const getConversationMessage = await Conversation.findOne({
          $or: [
            { sender: currentUserId, receiver: userId },
            { sender: userId, receiver: currentUserId },
          ],
        })
          .populate('messages')
          .sort({ updatedAt: -1 });

        // console.log('previous conversation message', getConversationMessage);

        socket.emit('message', getConversationMessage?.messages || []);
      });

      // new message -----------------------------------
      socket.on('new message', async (data) => {
        // const req = { files: data.files } as any; // Simulate an Express request
        // const res = {} as any; // Dummy response object

        // // Use the upload middleware to handle files
        // await uploadMiddleware(req, res);

        // const imageUrl = req.files?.chat_image
        //   ? path.join('uploads/images/chat-image', req.files.chat_image[0].filename)
        //   : null;

        // const videoUrl = req.files?.chat_video
        //   ? path.join('uploads/video/chat-video', req.files.chat_video[0].filename)
        //   : null;

        let conversation = await Conversation.findOne({
          $or: [
            { sender: data?.sender, receiver: data?.receiver },
            { sender: data?.receiver, receiver: data?.sender },
          ],
        });
        // if conversation is not available then create a new conversation
        if (!conversation) {
          conversation = await Conversation.create({
            sender: data?.sender,
            receiver: data?.receiver,
          });
        }
        const messageData = {
          text: data.text,
          imageUrl: data.imageUrl || '',
          videoUrl: data.videoUrl || '',
          msgByUserId: data?.msgByUserId,
        };
        const saveMessage = await Message.create(messageData);
        // update conversation
        await Conversation.updateOne(
          { _id: conversation?._id },
          {
            $push: { messages: saveMessage?._id },
          },
        );

        // get the conversation
        const getConversationMessage = await Conversation.findOne({
          $or: [
            { sender: data?.sender, receiver: data?.receiver },
            { sender: data?.receiver, receiver: data?.sender },
          ],
        })
          .populate('messages')
          .sort({ updatedAt: -1 });
        // send to the frontend ---------------
        io.to(data?.sender).emit(
          'message',
          getConversationMessage?.messages || [],
        );
        io.to(data?.receiver).emit(
          'message',
          getConversationMessage?.messages || [],
        );

        //send conversation
        const conversationSender = await getConversation(data?.sender);
        const conversationReceiver = await getConversation(data?.receiver);

        io.to(data?.sender).emit('conversation', conversationSender);
        io.to(data?.receiver).emit('conversation', conversationReceiver);
      });

      // sidebar
      socket.on('sidebar', async (crntUserId) => {
        const conversation = await getConversation(crntUserId);
        socket.emit('conversation', conversation);
      });

      // send
      socket.on('seen', async (msgByUserId) => {
        const conversation = await Conversation.findOne({
          $or: [
            { sender: currentUserId, receiver: msgByUserId },
            { sender: msgByUserId, receiver: currentUserId },
          ],
        });

        const conversationMessageId = conversation?.messages || [];
        // update the messages
        await Message.updateMany(
          { _id: { $in: conversationMessageId }, msgByUserId: msgByUserId },
          { $set: { seen: true } },
        );

        //send conversation
        const conversationSender = await getConversation(
          currentUserId as string,
        );
        const conversationReceiver = await getConversation(msgByUserId);

        io.to(currentUserId as string).emit('conversation', conversationSender);
        io.to(msgByUserId).emit('conversation', conversationReceiver);
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
    throw new Error(
      'Socket.io is not initialized. Call initializeSocket first.',
    );
  }
  return io;
};

export { initializeSocket, getIO };
