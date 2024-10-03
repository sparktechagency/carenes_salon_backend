import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { TLoginUser, TUser, TUserRole } from './user.interface';
import { User } from './user.model';
import { createToken, verifyToken } from './user.utils';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sendEmail } from '../../utilities/sendEmail';
import jwt from 'jsonwebtoken';
const registerUserIntoDB = async (payload: TUser) => {
  const user = await User.isUserExists(payload.email);
  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This user already registered');
  }
  const result = await User.create(payload);
  return result;
};

const loginUserIntoDB = async (payload: TLoginUser) => {
  // check if user is already exists ------
  //   const isUserExists = await User.findOne({ id: payload.id });
  const user = await User.isUserExists(payload.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  // checking if the user is already deleted ------------
  if (await User.isUserDeleted(payload.email)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  // if the user is blocked
  if (await User.isUserBlocked(payload.email)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }
  // checking if the password is correct ----
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
  }
  //   Access Granted : Send Access token ,refresh token
  // create token and send to the client ------------
  const jwtPayload = {
    id: user?._id,
    email: user?.email,
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
  // console.log(accessToken, refreshToken);
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
  // console.log(userData);
  const user = await User.isUserExists(userData.email);
  if (!(await User.isUserExists(userData.userId))) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  // checking if the user is already deleted ------------
  if (await User.isUserDeleted(userData.email)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  // if the user is blocked
  if (await User.isUserBlocked(userData.email)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }
  // checking if the password is correct ----
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
  // check if the token is valid-
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);
  const { email, iat } = decoded;
  // get the user if that here ---------

  const user = await User.isUserExists(email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  // checking if the user is already deleted ------------
  if (await User.isUserDeleted(email)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  // if the user is blocked
  if (await User.isUserBlocked(email)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }
  //
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
    email: user?.email,
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
const forgetPassword = async (email: string) => {
  const user = await User.isUserExists(email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  // checking if the user is already deleted ------------
  if (await User.isUserDeleted(email)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  // if the user is blocked
  if (await User.isUserBlocked(email)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }
  const jwtPayload = {
    id: user?._id,
    email: user?.email,
    role: user?.role as TUserRole,
  };
  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );
  const resetUiLink = `${config.reset_password_ui_link}?${user._id}&token=${resetToken}`;
  console.log(resetUiLink);
  sendEmail(user?.email, resetUiLink);
};

// reset password
const resetPassword = async (
  payload: { email: string; newPassword: string },
  token: string,
) => {
  const user = await User.isUserExists(payload.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  // checking if the user is already deleted ------------
  if (await User.isUserDeleted(payload.email)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  // if the user is blocked
  if (await User.isUserBlocked(payload.email)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }
  // verify token -------------
  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string,
  ) as JwtPayload;
  // console.log(decoded.userId, payload.id);
  if (decoded?.userId !== payload?.email) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are forbidden to access this',
    );
  }
  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );
  // update the new password
  await User.findOneAndUpdate(
    {
      email: decoded.email,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );
  return null;
};

const userServices = {
  registerUserIntoDB,
  loginUserIntoDB,
  changePasswordIntoDB,
  refreshToken,
  forgetPassword,
  resetPassword,
};

export default userServices;
