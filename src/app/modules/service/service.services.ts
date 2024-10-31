/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Category from '../category/category.model';
import Client from '../client/client.model';
import IService from './service.interface';
import Service from './service.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createService = async (shopId: string, payload: IService) => {
  const isCategoryExist = await Category.findById(payload.category);
  if (!isCategoryExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not exits');
  }
  const shop = await Client.findById(shopId);
  const result = await Service.create({
    ...payload,
    shop: shopId,
    shopCategory: shop.shopCategoryId,
  });
  return result;
};

const getAllService = async (query: Record<string, any>) => {
  const serviceQuery = new QueryBuilder(Service.find(), query)
    .search(['serviceName'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await serviceQuery.countTotal();
  const result = await serviceQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const updateService = async (id: string, payload: Partial<IService>) => {
  if (payload.category) {
    const isCategoryExist = await Category.findById(payload.category);
    if (!isCategoryExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not exits');
    }
  }
  const result = await Service.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteService = async (id: string) => {
  const result = await Service.findByIdAndDelete(id);
  return result;
};

const ServiceService = {
  createService,
  updateService,
  deleteService,
  getAllService
};

export default ServiceService;
