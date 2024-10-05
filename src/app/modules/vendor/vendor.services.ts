/* eslint-disable @typescript-eslint/no-explicit-any */

import Business from './vendor.model';
import QueryBuilder from '../../builder/QueryBuilder';

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

const businessServices = {
  getAllBusiness,
  getSingleBusinessFromDB,
};

export default businessServices;
