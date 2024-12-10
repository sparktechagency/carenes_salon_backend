import httpStatus from 'http-status';
import AppError from '../../error/appError';
import ShopBookmark from './shop.bookmark.model';
import Client from '../client/client.model';

// const createBookmarkIntoDB = async (shopId: string, customerId: string) => {
//   const isExists = await ShopBookmark.findOne({
//     shop: shopId,
//     costumer: customerId,
//   });
//   if (isExists) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'You already add this shop in bookmark',
//     );
//   }
//   const shop = await Client.findById(shopId);
//   if (!shop) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
//   }
//   const result = await ShopBookmark.create({
//     shop: shopId,
//     costumer: customerId,
//   });
//   return result;
// };

const shopBookmarkAddAndDelete = async (profileId: string, shopId: string) => {
  // check if article exists
  const shop = await Client.findById(shopId);
  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }
  const bookmark = await ShopBookmark.findOne({
    costumer: profileId,
    shop: shopId,
  });
  if (bookmark) {
    await ShopBookmark.findOneAndDelete({
      costumer: profileId,
      shop: shopId,
    });
    return null;
  } else {
    const result = await ShopBookmark.create({
      costumer: profileId,
      shop: shopId,
    });
    return result;
  }
};

// get bookmark from db
const getMyBookmarkFromDB = async (costumerId: string) => {
  const result = await ShopBookmark.find({ costumer: costumerId });
  return result;
};

// delete bookmark
const deleteBookmarkFromDB = async (id: string, costumerId: string) => {
  const bookmark = await ShopBookmark.findOne({
    _id: id,
    costumer: costumerId,
  });

  if (!bookmark) {
    throw new AppError(httpStatus.NOT_FOUND, 'This bookmark does not exists');
  }
  const result = await ShopBookmark.findOneAndDelete({
    _id: id,
    costumer: costumerId,
  });
  return result;
};
const shopBookmarkServices = {
  // createBookmarkIntoDB,
  shopBookmarkAddAndDelete,
  getMyBookmarkFromDB,
  deleteBookmarkFromDB,
};

export default shopBookmarkServices;
