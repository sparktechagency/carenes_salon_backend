/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { IClient } from './client.interface';
import Client from './client.model';
import { User } from '../user/user.model';
import { customerSpeed, maxDistanceForShop } from '../../constant';
import ShopBookmark from '../shopBookmak/shop.bookmark.model';
import mongoose from 'mongoose';
const updateClientProfile = async (
  userId: string,
  payload: Partial<IClient>,
) => {
  const result = await Client.findOneAndUpdate({ user: userId }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getAllClientFromDB = async (query: Record<string, any>) => {
  const ClientQuery = new QueryBuilder(Client.find(), query)
    .search(['name'])
    .fields()
    .filter()
    .paginate()
    .sort();
  const meta = await ClientQuery.countTotal();
  const result = await ClientQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const updateClientStatus = async (id: string, status: string) => {

  const client=  await Client.findById(id);
  if(!client){
    throw new AppError(httpStatus.NOT_FOUND,"Client not found")
  }
  const session = await Client.startSession();
  session.startTransaction();

  try {
    const result = await Client.findByIdAndUpdate(
      id,
      { status: status },
      { runValidators: true, new: true, session: session },
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'Client not found');
    }

    const isActive = status === 'active';

    await User.findOneAndUpdate(
      { _id: result.user },
      { isActive: isActive },
      { runValidators: true, new: true, session: session },
    );

    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Something went wrong ,try again letter ',
    );
  }
};

const getNearbyShopWithTime = async (
  customerId: string,
  payload: {
    latitude: number;
    longitude: number;
  },
  query: Record<string, any>,
) => {
  const matchStage: any[] = [
    ...(query.shopName
      ? [
          {
            $match: {
              shopName: { $regex: query.shopName, $options: 'i' },
            },
          },
        ]
      : []),
  ];

  // Base aggregation pipeline
  const pipeline: any[] = [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [payload.longitude, payload.latitude],
        },
        distanceField: 'distance', // This will store the distance in meters
        maxDistance: maxDistanceForShop, // Distance in meters
        spherical: true, // Use spherical geometry for Earth-like distances
      },
    },
    ...matchStage,
  ];

  // If categoryId is present in the query, perform a lookup
  // if (query.shopCategoryId) {
  //   pipeline.push(
  //     {
  //       $lookup: {
  //         from: 'shopcategories', // Name of the categories collection
  //         localField: 'shopCategoryId', // Field in Vendor that holds category IDs
  //         foreignField: '_id', // Field in Categories collection
  //         as: 'categoryDetails', // Name of the output array field
  //       },
  //     },
  //     {
  //       $match: {
  //         'categoryDetails._id': query.shopCategoryId, // Filter by category ID
  //       },
  //     },
  //   );
  // }
  if (query.shopCategoryId) {
    pipeline.push(
      {
        $match: {
          // shopCategoryId: query.shopCategoryId,
          shopCategoryId: new mongoose.Types.ObjectId(query.shopCategoryId)
        },
      },
    );
  }

  // Add estimated time calculation
  pipeline.push({
    $addFields: {
      estimatedTime: {
        $divide: ['$distance', customerSpeed], // distance / speed
      },
    },
  });

  const result = await Client.aggregate(pipeline);

  const bookmarks = await ShopBookmark.find({ customer: customerId }).select(
    'shop',
  );
  const bookmarkedShopIds = new Set(bookmarks.map((b) => b.shop.toString()));

  const enrichedResult = result.map((shop) => ({
    ...shop,
    isBookmark: bookmarkedShopIds.has(shop._id.toString()),
  }));

  return enrichedResult;
};

const ClientServices = {
  updateClientProfile,
  getAllClientFromDB,
  updateClientStatus,
  getNearbyShopWithTime
};

export default ClientServices;
