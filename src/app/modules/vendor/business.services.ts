/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IBusiness } from './bussiness.interface';
import Business from './bussiness.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createBusinessIntoDB = async (
  userId: string,
  payload: Partial<IBusiness>,
) => {
  const isExists = await Business.findOne({ vendor: userId });
  if (isExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already have a business.If you make another business you should login with another account',
    );
  }
  const result = await Business.create({ vendor: userId, ...payload });
  return result;
};

// get all business

const getAllBusiness = async (query: Record<string, any>) => {
  const businessQuery = new QueryBuilder(Business.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await businessQuery.countTotal();
  const result = await businessQuery.modelQuery;

  return {
    meta,
    result,
  };
};

// get single business from db
const getSingleBusinessFromDB = async (id: string) => {
  const result = await Business.findById(id);
  return result;
};

const updateBusinessIntoDB = async (
  id: string,
  payload: Partial<IBusiness>,
) => {
  const business = await Business.findById(id);

  if (!business) {
    throw new AppError(httpStatus.NOT_FOUND, 'Business not fount');
  }
  const result = await Business.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const businessServices = {
  createBusinessIntoDB,
  getAllBusiness,
  getSingleBusinessFromDB,
  updateBusinessIntoDB,
};

export default businessServices;
