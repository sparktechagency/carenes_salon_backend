/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from '../../builder/QueryBuilder';
import { IRider } from './rider.interface';
import Rider from './rider.model';

const updateRiderProfile = async (userId: string, payload: Partial<IRider>) => {
  const result = await Rider.findOneAndUpdate({ user: userId }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getAllRiderFromDB = async (query: Record<string, any>) => {
  const riderQuery = new QueryBuilder(Rider.find(), query)
    .search(['name'])
    .fields()
    .filter()
    .paginate()
    .sort();
  const meta = await riderQuery.countTotal();
  const result = await riderQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const riderServices = {
  updateRiderProfile,
  getAllRiderFromDB,
};

export default riderServices;
