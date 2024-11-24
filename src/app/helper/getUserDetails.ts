import httpStatus from 'http-status';
import AppError from '../error/appError';
import { User } from '../modules/user/user.model';
import { USER_ROLE } from '../modules/user/user.constant';
import Customer from '../modules/customer/customer.model';
import Client from '../modules/client/client.model';


const getUserDetails = async (id: string) => {
  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Id not found');
  }
  const user = await User.findById(id).select('-password');
  let userDetails;
    if(user.role == USER_ROLE.customer){
      userDetails = await Customer.findOne({user:user._id}).select("firstName lastName profile_image user ");
    }
    else if(user?.role == USER_ROLE.client){
      userDetails = await Client.findOne({user:user._id}).select("shopName shopImages");
    }
  return userDetails;
};

export default getUserDetails;
