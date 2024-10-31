/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { IProduct } from './product.interface';
import { Product } from './product.model';

const createProductIntoDB = async (shopId: string, payload: IProduct) => {
  const result = await Product.create({ ...payload, shop: shopId });
  return result;
};

const getAllProduct = async (query: Record<string, any>) => {
  const productQuery = new QueryBuilder(Product.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await productQuery.countTotal();
  const result = await productQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleProduct = async (id: string) => {
  const result = await Product.findById(id);
  return result;
};

const updateProduct = async (id: string,shopId:string, payload: Partial<IProduct>) => {
  //!TODO: need to use id and shop id both for update product
  const product = await Product.findOne({_id:id,shop:shopId});
  if(!product){
    throw new AppError(httpStatus.BAD_REQUEST,"Unauthorized access")
  }
  const result = await Product.findOneAndUpdate({_id:id,shop:shopId}, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteProductFromDB = async (id: string, profileId: string) => {
  //!TODO: need to use id and shop id both for update product
  const result = await Product.findOneAndDelete({ _id: id, shop: profileId });
  return result;
};

const changeProductStatus = async (
  id: string,
  profileId: string,
  status: string,
) => {
  const result = await Product.findOneAndUpdate(
    { _id: id, shop: profileId },
    { status: status },
    { new: true, runValidators: true },
  );
  return result;
};

const getMyProducts = async (shopId: string, query: Record<string, any>) => {
  const productQuery = new QueryBuilder(Product.find({ shop: shopId }), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await productQuery.countTotal();
  const result = await productQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSpecificShopProducts = async (
  customerId: string,
  shopId: string,
  query: Record<string, any>,
) => {
  const productQuery = new QueryBuilder(Product.find({ shop: shopId }), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await productQuery.countTotal();
  const result = await productQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const productServices = {
  createProductIntoDB,
  getAllProduct,
  getSingleProduct,
  updateProduct,
  deleteProductFromDB,
  changeProductStatus,
  getMyProducts,
  getSpecificShopProducts,
};

export default productServices;
