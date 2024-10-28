/* eslint-disable @typescript-eslint/no-explicit-any */

import QueryBuilder from '../../builder/QueryBuilder';

import { User } from '../user/user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { maxDistanceForShop, ClientSpeed } from '../../constant';
import ShopBookmark from '../shopBookmak/shop.bookmark.model';
import Product from '../product/product.model';
import { IAdmin } from './admin.interface';
import Admin from './admin.model';
import mongoose from 'mongoose';

const updateAdminProfile = async (userId: string, payload: Partial<IAdmin>) => {
  const result = await Admin.findOneAndUpdate({ user: userId }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteAdminFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const admin = await Admin.findById(id).session(session);
    if (!admin) {
      throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');
    }

    // Delete associated User and Admin within the transaction
    await User.findByIdAndDelete(admin.user).session(session);
    await Admin.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    return null;
  } catch (error) {
    await session.abortTransaction();
    throw error; // re-throw the error for further handling
  } finally {
    session.endSession();
  }
};

// update Admin status
const updateAdminStatus = async (id: string, status: string) => {
  const session = await Admin.startSession();
  session.startTransaction();

  try {
    const result = await Admin.findByIdAndUpdate(
      id,
      { status: status },
      { runValidators: true, new: true, session: session },
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');
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

// get all Admin

const getAllAdminFromDB = async (query: Record<string, any>) => {
  const AdminQuery = new QueryBuilder(Admin.find(), query)
    .search(['storeName'])
    .fields()
    .filter()
    .paginate()
    .sort();
  const meta = await AdminQuery.countTotal();
  const result = await AdminQuery.modelQuery;

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
  },
  query: Record<string, any>,
) => {
  const matchStage: any[] = [
    ...(query.storeName
      ? [
          {
            $match: {
              storeName: { $regex: query.storeName, $options: 'i' },
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
  if (query.categoryId) {
    pipeline.push(
      {
        $lookup: {
          from: 'categories', // Name of the categories collection
          localField: 'categories', // Field in Admin that holds category IDs
          foreignField: '_id', // Field in Categories collection
          as: 'categoryDetails', // Name of the output array field
        },
      },
      {
        $match: {
          'categoryDetails._id': query.categoryId, // Filter by category ID
        },
      },
    );
  }

  // Add estimated time calculation
  pipeline.push({
    $addFields: {
      estimatedTime: {
        $divide: ['$distance', ClientSpeed], // distance / speed
      },
    },
  });

  const result = await Admin.aggregate(pipeline);

  const bookmarks = await ShopBookmark.find({ customer: customerId }).select(
    'shop',
  );
  const bookmarkedShopIds = new Set(bookmarks.map((b) => b.shop.toString()));

  const shopIds = result.map((shop) => shop._id);
  const products = await Product.find({
    shop: { $in: shopIds },
  }).select('name shop');

  const productsByShopId = products.reduce(
    (acc, product) => {
      const shopId = product.shop.toString();
      if (!acc[shopId]) {
        acc[shopId] = [];
      }
      acc[shopId].push(product);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const enrichedResult = result.map((shop) => ({
    ...shop,
    isBookmark: bookmarkedShopIds.has(shop._id.toString()),
    products: productsByShopId[shop._id.toString()] || [],
  }));

  return enrichedResult;
};

// rating
const addRating = async (shopId: string, rating: number) => {
  const result = await Admin.findByIdAndUpdate(
    shopId,
    {
      $inc: { totalRating: 1, totalRatingCount: rating },
    },
    { new: true, runValidators: true },
  );
  return result;
};

const AdminServices = {
  updateAdminProfile,
  updateAdminStatus,
  getAllAdminFromDB,
  getNearbyShopWithTime,
  addRating,
  deleteAdminFromDB,
};

export default AdminServices;
