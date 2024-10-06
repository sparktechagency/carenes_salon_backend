/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface TUser {
  // profileId: string;
  // id: string;
  _id: string;
  email: string;
  password: string;
  passwordChangedAt?: Date;
  role: 'customer' | 'rider' | 'vendor' | 'superAdmin';
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
}
export interface TLoginUser {
  email: string;
  password: string;
}

export interface UserModel extends Model<TUser> {
  // myStaticMethod(): number;
  isUserExists(email: string): Promise<TUser>;
  //   isUserDeleted(email: string): Promise<boolean>;
  //   isUserBlocked(email: string): Promise<boolean>;
  isPasswordMatched(
    plainPassword: string,
    hashPassword: string,
  ): Promise<TUser>;
  isJWTIssuedBeforePasswordChange(
    passwordChangeTimeStamp: Date,
    jwtIssuedTimeStamp: number,
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
