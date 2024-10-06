/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import Customer from './customer.model';
import { ICustomer } from './customer.interface';

const getAllCustomer = async (query: Record<string, any>) => {
  const customerQuery = new QueryBuilder(Customer.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await customerQuery.countTotal();
  const result = await customerQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const updateCustomerProfile = async (
  userId: string,
  payload: Partial<ICustomer>,
) => {
  const customer = await Customer.findOne({ user: userId });

  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  const result = await Customer.findOneAndUpdate({ user: userId }, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const customerServices = {
  getAllCustomer,
  updateCustomerProfile,
};

export default customerServices;
