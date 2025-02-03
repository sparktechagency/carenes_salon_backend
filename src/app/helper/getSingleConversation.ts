/* eslint-disable @typescript-eslint/no-explicit-any */
import Client from '../modules/client/client.model';
import Conversation from '../modules/conversation/conversation.model';
import Customer from '../modules/customer/customer.model';
import { USER_ROLE } from '../modules/user/user.constant';

export const getSingleConversation = async (
  currentUserId: string,
  receiverId: string,
) => {
  if (!currentUserId || !receiverId) return null;

  const conversation = await Conversation.findOne({
    $or: [
      { sender: currentUserId, receiver: receiverId },
      { sender: receiverId, receiver: currentUserId },
    ],
  })
    .sort({ updatedAt: -1 })
    .populate('messages')
    .populate('sender')
    .populate('receiver');

  if (!conversation) return null;

  const countUnseenMessage = conversation.messages?.reduce(
    (prev: number, curr: any) =>
      curr.msgByUserId.toString() !== currentUserId && !curr.seen
        ? prev + 1
        : prev,
    0,
  );

  // Identify the other user in the conversation
  const otherUser =
    conversation.sender._id.toString() === currentUserId
      ? conversation.receiver
      : conversation.sender;

  // Fetch additional user details if necessary
  let userData = null;
  if (otherUser?.role === USER_ROLE.customer) {
    userData = await Customer.findOne({ user: otherUser._id });
  } else if (otherUser?.role === USER_ROLE.client) {
    userData = await Client.findOne({ user: otherUser._id });
  }

  return {
    _id: conversation._id,
    userData: {
      id: otherUser._id,
      user: userData?.user,
      name: userData ? `${userData.firstName} ${userData.lastName}` : '',
      profileImage: userData?.shopImages
        ? userData?.shopImages[0]
        : userData?.profile_image,
    },
    unseenMsg: countUnseenMessage,
    lastMsg: conversation.messages[conversation.messages.length - 1],
  };
};
