import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IShopCategory } from './shopCategory.interface';
import ShopCategory from './shopCategory.model';

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

const ShopCategoryServices = {
  createShopCategory,
  updateShopCategory,
  deleteShopCategory,
};

export default ShopCategoryServices;
