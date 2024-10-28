import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import { TUserRole } from '../user/user.interface';
import { createToken, verifyToken } from '../user/user.utils';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import sendSMS from '../../helper/sendSms';
// import { sendEmail } from '../../utilities/sendEmail';
// import generateResetPasswordEmail from '../../helper/generateResetPasswordEmail';
const generateVerifyCode = (): number => {
  return Math.floor(10000 + Math.random() * 90000);
};
const loginUserIntoDB = async (payload: TLoginUser) => {
  const user = await User.isUserExists(payload.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }
  // checking if the password is correct ----
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
  }
  const jwtPayload = {
    id: user?._id,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
    role: user?.role as TUserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
  };
};

// change password
const changePasswordIntoDB = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  const user = await User.isUserExists(userData.phoneNumber);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  if (!(await User.isPasswordMatched(payload?.oldPassword, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
  }
  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );
  await User.findOneAndUpdate(
    {
      id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );
  return null;
};

const refreshToken = async (token: string) => {
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);
  const { phoneNumber, iat } = decoded;

  const user = await User.isUserExists(phoneNumber);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }
  if (
    user?.passwordChangedAt &&
    (await User.isJWTIssuedBeforePasswordChange(
      user?.passwordChangedAt,
      iat as number,
    ))
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
  }
  const jwtPayload = {
    id: user?._id,
    // email: user?.email,
    phoneNumber: user?.phoneNumber,
    role: user?.role as TUserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  return { accessToken };
};

// forgot password
const forgetPassword = async (phoneNumber: string) => {
  const user = await User.isUserExists(phoneNumber);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  const resetCode = generateVerifyCode();
  await User.findOneAndUpdate(
    { phoneNumber: phoneNumber },
    {
      resetCode: resetCode,
      isResetVerified: false,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    },
  );
  const smsMessage = `Your reset password code is: ${resetCode}`;
  await sendSMS(phoneNumber, smsMessage);
  return null;

  // const jwtPayload = {
  //   id: user?._id,
  //   email: user?.email,
  //   role: user?.role as TUserRole,
  // };
  // const resetToken = createToken(
  //   jwtPayload,
  //   config.jwt_access_secret as string,
  //   '10m',
  // );
  // const resetUiLink = `${config.reset_password_ui_link}?${user._id}&token=${resetToken}`;
  // const emailContent = generateResetPasswordEmail(resetUiLink);

  // // Send the email
  // sendEmail(user?.email, 'Reset your password within 10 mins!', emailContent);
};

// verify forgot otp

const verifyResetOtp = async (phoneNumber: string, resetCode: number) => {
  const user = await User.isUserExists(phoneNumber);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  if (user.codeExpireIn < new Date(Date.now())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Reset code is expire');
  }
  if (user.resetCode !== Number(resetCode)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Reset code is invalid');
  }
  await User.findOneAndUpdate(
    { phoneNumber: phoneNumber },
    { isResetVerified: true },
    { new: true, runValidators: true },
  );
  return null;
};

// reset password
const resetPassword = async (payload: {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}) => {
  if (payload.password !== payload.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match",
    );
  }
  const user = await User.isUserExists(payload.phoneNumber);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (!user.isResetVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You need to verify reset code before reset password',
    );
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }
  // verify token -------------
  // const decoded = jwt.verify(
  //   token,
  //   config.jwt_access_secret as string,
  // ) as JwtPayload;
  // // console.log(decoded.userId, payload.id);
  // if (decoded?.userId !== payload?.email) {
  //   throw new AppError(
  //     httpStatus.FORBIDDEN,
  //     'You are forbidden to access this',
  //   );
  // }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );
  // update the new password
  await User.findOneAndUpdate(
    {
      phoneNumber: payload.phoneNumber,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );
  const jwtPayload = {
    id: user?._id,
    // email: user?.email,
    phoneNumber: user?.phoneNumber,
    role: user?.role as TUserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return { accessToken, refreshToken };
};

const resendResetCode = async (phoneNumber: string) => {
  const user = await User.isUserExists(phoneNumber);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  const resetCode = generateVerifyCode();
  await User.findOneAndUpdate(
    { phoneNumber: phoneNumber },
    {
      resetCode: resetCode,
      isResetVerified: false,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    },
  );
  const smsMessage = `Your reset password code is: ${resetCode}`;
  await sendSMS(phoneNumber, smsMessage);
  return null;
};

const authServices = {
  loginUserIntoDB,
  changePasswordIntoDB,
  refreshToken,
  forgetPassword,
  resetPassword,
  verifyResetOtp,
  resendResetCode,
};

export default authServices;
