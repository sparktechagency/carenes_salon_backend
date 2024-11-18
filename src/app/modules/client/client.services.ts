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
import Category from '../category/category.model';
import Service from '../service/service.model';
import getCurrentDay from '../../helper/getCurrentDay';
import BusinessHour from '../bussinessHour/businessHour.model';
import Discount from '../discount/discount.model';
import ShopCategory from '../shopCategory/shopCategory.model';
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

const addShopDetails = async (id: string, payload: Partial<IClient>) => {
  const shop = await Client.findById(id);
  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  const isCategoryExist = await ShopCategory.findOne({
    categoryName: payload.shopCategory,
  });
  if (!isCategoryExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop category not found');
  }

  const result = await Client.findByIdAndUpdate(
    id,
    { ...payload, isShopInfoProvided: true },
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};

const addBankDetails = async (id: string, payload: Partial<IClient>) => {
  const shop = await await Client.findById(id);

  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  const result = await Client.findByIdAndUpdate(
    id,
    { ...payload, isProfileCompleted: true },
    { new: true, runValidators: true },
  );
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
  const client = await Client.findById(id);
  if (!client) {
    throw new AppError(httpStatus.NOT_FOUND, 'Client not found');
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

// const getNearbyShopWithTime = async (
//   customerId: string,
//   payload: {
//     latitude: number;
//     longitude: number;
//   },
//   query: Record<string, any>,
// ) => {
//   const matchStage: any[] = [
//     ...(query.shopName
//       ? [
//           {
//             $match: {
//               shopName: { $regex: query.shopName, $options: 'i' },
//             },
//           },
//         ]
//       : []),
//     ...(query.shopGenderCategory
//       ? [
//           {
//             $match: {
//               shopGenderCategory: query.shopGenderCategory,
//             },
//           },
//         ]
//       : []),
//   ];

//   // Base aggregation pipeline
//   const pipeline: any[] = [
//     {
//       $geoNear: {
//         near: {
//           type: 'Point',
//           coordinates: [payload.longitude, payload.latitude],
//         },
//         distanceField: 'distance', // This will store the distance in meters
//         maxDistance: maxDistanceForShop, // Distance in meters
//         spherical: true, // Use spherical geometry for Earth-like distances
//       },
//     },
//     ...matchStage,
//   ];
//   if (query.shopCategoryId) {
//     pipeline.push({
//       $match: {
//         // shopCategoryId: query.shopCategoryId,
//         shopCategoryId: new mongoose.Types.ObjectId(query.shopCategoryId),
//       },
//     });
//   }

//   // Add estimated time calculation
//   pipeline.push({
//     $addFields: {
//       estimatedTime: {
//         $divide: ['$distance', customerSpeed], // distance / speed
//       },
//     },
//   });

//   const result = await Client.aggregate(pipeline);

//   const bookmarks = await ShopBookmark.find({ customer: customerId }).select(
//     'shop',
//   );
//   const bookmarkedShopIds = new Set(bookmarks.map((b) => b.shop.toString()));

//   const enrichedResult = result.map((shop) => ({
//     ...shop,
//     isBookmark: bookmarkedShopIds.has(shop._id.toString()),
//   }));

//   return enrichedResult;
// };

// get single shop -----------------------------
// const getSingleShop = async (id: string) => {
//   const currentDay = getCurrentDay();
//   const businessHour = await BusinessHour.findOne({entityId:id,day:currentDay}).select("day openTime closeTime isClose");

//   // Find the client/shop by ID and populate the shopCategoryId
//   const shop = await Client.findById(id).populate('shopCategoryId').select("shopImages shopName location totalRating totalRatingCount _id shopGenderCategory"); // Populate the shop category details

//   // Check if the shop was found
//   if (!shop) {
//    throw new AppError(httpStatus.NOT_FOUND,'Shop not found');
//   }

//   // Fetch categories related to the shop's ID
//   const categories = await Category.find({ shop: shop._id }).select("categoryName appointmentColor").exec();

//   // For each category, fetch associated services
//   const categoriesWithServices = await Promise.all(
//     categories.map(async (category) => {
//       const services = await Service.find({ category: category._id }).select("serviceName availableFor durationMinutes price").exec();
//       return {
//         ...category.toObject(), // Convert category document to plain object
//         services: services.map(service => ({
//           ...service.toObject(), // Convert service document to plain object
//         })),
//       };
//     })
//   );

//   // Format the response as required
//   return {
//     ...shop.toObject(), // Convert shop document to plain object
//     categories: categoriesWithServices,
//     businessHour
//   };
// };
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
    ...(query.shopGenderCategory
      ? [
          {
            $match: {
              shopGenderCategory: query.shopGenderCategory,
            },
          },
        ]
      : []),
  ];

  // Base aggregation pipeline
  const pipeline: any[] = [];

  // Conditionally add $geoNear if nearby is true
  if (query.nearby) {
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [payload.longitude, payload.latitude],
        },
        distanceField: 'distance', // This will store the distance in meters
        maxDistance: maxDistanceForShop, // Distance in meters
        spherical: true, // Use spherical geometry for Earth-like distances
      },
    });
  }

  // Add match stages for shopName and shopGenderCategory if provided
  pipeline.push(...matchStage);

  // Add filter for shopCategoryId if provided
  if (query.shopCategoryId) {
    pipeline.push({
      $match: {
        shopCategoryId: new mongoose.Types.ObjectId(query.shopCategoryId),
      },
    });
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

const getSingleShop = async (id: string) => {
  const currentDay = getCurrentDay();
  const now = new Date();

  // Fetch business hours for the current day
  const businessHour = await BusinessHour.findOne({
    entityId: id,
    day: currentDay,
  }).select('day openTime closeTime isClose');

  // Find the client/shop by ID and populate the shopCategoryId
  const shop = await Client.findById(id)
    .populate('shopCategoryId')
    .select(
      'shopImages shopName location totalRating totalRatingCount _id shopGenderCategory',
    );

  // Check if the shop was found
  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  // Fetch categories related to the shop's ID
  const categories = await Category.find({ shop: shop._id })
    .select('categoryName appointmentColor')
    .exec();

  // Check for an active discount
  const discount = await Discount.findOne({
    shop: id,
    discountStartDate: { $lte: now },
    discountEndDate: { $gte: now },
  });

  const isAllServicesDiscounted = discount?.services === 'all-services';
  // console.log("is all service discount",isAllServicesDiscounted);
  // For each category, fetch associated services and apply discount if applicable
  const categoriesWithServices = await Promise.all(
    categories.map(async (category) => {
      const services = await Service.find({ category: category._id })
        .select('serviceName availableFor durationMinutes price')
        .exec();

      const servicesWithDiscount = services.map((service) => {
        const isServiceDiscounted =
          isAllServicesDiscounted ||
          (discount?.services instanceof Array &&
            discount.services.includes(service._id));

        if (isServiceDiscounted) {
          const discountAmount =
            service.price * (discount.discountPercentage / 100);
          const discountPrice = service.price - discountAmount;
          console.log('discount price', discountPrice);
          return {
            ...service.toObject(),
            discountPrice: discountPrice,
          };
        }

        return service.toObject();
      });

      return {
        ...category.toObject(),
        services: servicesWithDiscount,
      };
    }),
  );

  // Format the response as required
  return {
    ...shop.toObject(),
    categories: categoriesWithServices,
    businessHour,
  };
};

const getShopDetails = async (id: string) => {
  const shop = await Client.findById(id);
  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  return shop;
};

const ClientServices = {
  updateClientProfile,
  getAllClientFromDB,
  updateClientStatus,
  getNearbyShopWithTime,
  getSingleShop,
  addShopDetails,
  addBankDetails,
  getShopDetails
};

export default ClientServices;
