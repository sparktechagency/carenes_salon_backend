import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IBusiness } from './bussiness.interface';
import Business from './bussiness.model';

const createBusinessIntoDB = async (payload: IBusiness) => {
  const isExists = await Business.findOne({ vendor: payload?.vendor });
  if (isExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already have a business.If you make another business you should login with another account',
    );
  }
  const result = await Business.create(payload);
  return result;
};

const businessServices = {
  createBusinessIntoDB,
};

export default businessServices;
