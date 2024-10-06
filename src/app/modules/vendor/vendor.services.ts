/* eslint-disable @typescript-eslint/no-explicit-any */

import Business from './vendor.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { IVendor } from './vendor.interface';
import Vendor from './vendor.model';

// get all business-------------

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

const updateVendorProfile = async (
  userId: string,
  payload: Partial<IVendor>,
) => {
  const result = await Vendor.findOneAndUpdate({ user: userId }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const vendorServices = {
  getAllBusiness,
  getSingleBusinessFromDB,
  updateVendorProfile,
};

export default vendorServices;
