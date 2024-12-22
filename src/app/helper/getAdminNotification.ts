import Notification from '../modules/notification/notification.model';

const getAdminNotificationCount = async () => {
  const unseenCount = await Notification.countDocuments({
    seen: false,
    receiver: 'admin',
  });
  return unseenCount;
};

export default getAdminNotificationCount;
