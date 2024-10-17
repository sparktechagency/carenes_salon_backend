import Notification from '../modules/notification/notification.model';

const getUnseenNotificationCount = async (receiver: string) => {
  const unseenCount = await Notification.countDocuments({
    seen: false,
    receiver: receiver,
  });
  const notifications = await Notification.find({ receiver: receiver });
  return { unseenCount, notifications: notifications };
};

export default getUnseenNotificationCount;
