/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from '../../builder/QueryBuilder';
import { IClient } from './client.interface';
import Client from './client.model';
const updateClientProfile = async (
  userId: string,
  payload: Partial<IClient>,
) => {
  const result = await Client.findOneAndUpdate({ user: userId }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getAllClientFromDB = async (query: Record<string, any>) => {
  const ClientQuery = new QueryBuilder(Client.find(), query)
    .search(['name'])
    .fields()
    .filter()
    .paginate()
    .sort();
  const meta = await ClientQuery.countTotal();
  const result = await ClientQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const ClientServices = {
  updateClientProfile,
  getAllClientFromDB,
};

export default ClientServices;
