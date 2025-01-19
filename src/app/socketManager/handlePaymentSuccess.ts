/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import httpStatus from 'http-status';
import AppError from '../error/appError';
import NormalUser from '../modules/normalUser/normalUser.model';
import {
  ENUM_COLLABORATION_STATUS,
  ENUM_PAYMENT_PURPOSE,
  ENUM_TRANSACTION_TYPE,
} from '../utilities/enum';
import Collaboration from '../modules/collaboration/collaboration.model';
import Transaction from '../modules/transaction/transaction.model';
import { INormalUser } from '../modules/normalUser/normalUser.interface';

const handlePaymentSuccess = async (
  metaData: any,
  transactionId: string,
  amount: number,
) => {
  if (metaData.paymentPurpose == ENUM_PAYMENT_PURPOSE.PURCHASE_SUBSCRIPTION) {
    await handleSubcriptionPurchaseSuccess(
      metaData.userId,
      transactionId,
      amount,
    );
  } else if (
    metaData.paymentPurpose == ENUM_PAYMENT_PURPOSE.RENEW_SUBSCRIPTION
  ) {
    await handleSubscriptionRenewSuccess(
      metaData.userid,
      transactionId,
      amount,
    );
  } else if (
    metaData.paymentPurpose == ENUM_PAYMENT_PURPOSE.COLLABRATE_PAYMENT
  ) {
    await handleCollabratePaymentSuccess(
      metaData?.collaborationId,
      transactionId,
      amount,
    );
  }
};

const handleSubcriptionPurchaseSuccess = async (
  userId: string,
  transactionId: string,
  amount: number,
) => {
  console.log(transactionId);
  const normalUser = await NormalUser.findById(userId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await NormalUser.findByIdAndUpdate(
    userId,
    {
      subscriptionPurchaseDate: new Date(),
      subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isPremium: true,
    },
    { new: true, runValidators: true },
  );
  await Transaction.create({
    user: normalUser?._id,
    email: normalUser?.email,
    type: ENUM_TRANSACTION_TYPE.PURCHASE_SUBSCRIPTION,
    amount: amount,
  });
};

const handleSubscriptionRenewSuccess = async (
  userId: string,
  transactionId: string,
  amount: number,
) => {
  console.log(transactionId);
  const normalUser = await NormalUser.findById(userId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  await NormalUser.findByIdAndUpdate(
    userId,
    {
      subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subscriptionRenewDate: new Date(),
    },
    { new: true, runValidators: true },
  );
  await Transaction.create({
    user: normalUser?._id,
    email: normalUser?.email,
    type: ENUM_TRANSACTION_TYPE.RENEW_SUBSCRIPTION,
    amount: amount,
  });
};

const handleCollabratePaymentSuccess = async (
  collaborationId: string,
  transactionId: string,
  amount: number,
) => {
  const collaboration = await Collaboration.findById(collaborationId).populate({
    path: 'receiver',
    select: 'email',
  });
  if (!collaboration) {
    throw new AppError(httpStatus.NOT_FOUND, 'Collaboration not found');
  }
  await Collaboration.findByIdAndUpdate(
    collaborationId,
    { status: ENUM_COLLABORATION_STATUS.UPCOMING },
    { new: true, runValidators: true },
  );
  const receiver = collaboration.receiver as INormalUser;
  await Transaction.create({
    user: collaboration?.receiver,
    email: receiver?.email,
    type: ENUM_TRANSACTION_TYPE.COLLABORATION,
    amount: amount,
  });
};

export default handlePaymentSuccess;
