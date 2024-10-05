/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from '../../builder/QueryBuilder';
import Customer from './customer.model';

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

const customerServices = {
  getAllCustomer,
};

export default customerServices;
