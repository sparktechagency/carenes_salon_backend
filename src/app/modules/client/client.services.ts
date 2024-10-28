/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { IClient } from './client.interface';
import Client from './client.model';
import { User } from '../user/user.model';
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

const updateClientStatus = async (id: string, status: string) => {
  const session = await Client.startSession();
  session.startTransaction();

  try {
    const result = await Client.findByIdAndUpdate(
      id,
      { status: status },
      { runValidators: true, new: true, session: session },
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'Client not found');
    }

    const isActive = status === 'activate';

    await User.findOneAndUpdate(
      { _id: result.user },
      { isActive: isActive },
      { runValidators: true, new: true, session: session },
    );

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Something went wrong ,try again letter ',
    );
  }
};

const ClientServices = {
  updateClientProfile,
  getAllClientFromDB,
  updateClientStatus,
};

export default ClientServices;
