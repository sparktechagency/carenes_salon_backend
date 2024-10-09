/* eslint-disable @typescript-eslint/no-explicit-any */

import QueryBuilder from '../../builder/QueryBuilder';
import { IVendor } from './vendor.interface';
import Vendor from './vendor.model';
import { User } from '../user/user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { maxDistanceForShop, riderSpeed } from '../../constant';
import ShopBookmark from '../shopBookmak/shop.bookmark.model';

const updateVendorProfile = async (
  userId: string,
  payload: Partial<IVendor>,
) => {
  const result = await Vendor.findOneAndUpdate({ user: userId }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

// update vendor status
const updateShopStatus = async (id: string, status: string) => {
  const session = await Vendor.startSession();
  session.startTransaction();

  try {
    const result = await Vendor.findByIdAndUpdate(
      id,
      { status: status },
      { runValidators: true, new: true, session: session },
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'Vendor not found');
    }

    const isActive = status === 'activate';

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

// get all vendor

const getAllVendorFromDB = async (query: Record<string, any>) => {
  const vendorQuery = new QueryBuilder(Vendor.find(), query)
    .search(['storeName'])
    .fields()
    .filter()
    .paginate()
    .sort();
  const meta = await vendorQuery.countTotal();
  const result = await vendorQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getNearbyShopWithTime = async (
  customerId: string,
  payload: {
    latitude: number;
    longitude: number;
    maxDistanceForShop: number;
    // riderSpeed: number; // Speed in meters per second (m/s), e.g., 10 m/s ≈ 36 km/h
  },
  query: Record<string, any>,
) => {
  const matchStage = query.storeName
    ? {
        $match: {
          name: { $regex: query.storeName, $options: 'i' },
        },
      }
    : null;
  const result = await Vendor.aggregate([
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
    ...(matchStage ? [matchStage] : []),
    {
      $addFields: {
        estimatedTime: {
          $divide: ['$distance', riderSpeed], // distance / speed to get time in seconds
        },
      },
    },
  ]);
  const bookmarks = await ShopBookmark.find({ costumer: customerId }).select(
    'shop',
  );
  const bookmarkedShopIds = new Set(bookmarks.map((b) => b.shop.toString()));

  const enrichedResult = result.map((shop) => ({
    ...shop,
    isBookmark: bookmarkedShopIds.has(shop._id.toString()),
  }));

  return enrichedResult;
};

const vendorServices = {
  updateVendorProfile,
  updateShopStatus,
  getAllVendorFromDB,

  getNearbyShopWithTime,
};

export default vendorServices;
