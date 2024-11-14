/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IShopCategory } from './shopCategory.interface';
import ShopCategory from './shopCategory.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createShopCategory = async (payload: IShopCategory) => {
  const result = await ShopCategory.create(payload);

  return result;
};

const updateShopCategory = async (
  id: string,
  payload: Partial<IShopCategory>,
) => {
  const isExist = await ShopCategory.findById(id);
  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop Category not found');
  }

  const result = await ShopCategory.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteShopCategory = async (id: string) => {
  const result = await ShopCategory.findByIdAndDelete(id);
  return result;
};

const getAllShopCategory = async (query: Record<string, any>) => {
  const shopCategoryQuery = new QueryBuilder(ShopCategory.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await shopCategoryQuery.countTotal();
  const result = await shopCategoryQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const ShopCategoryServices = {
  createShopCategory,
  updateShopCategory,
  deleteShopCategory,
  getAllShopCategory
};

export default ShopCategoryServices;
