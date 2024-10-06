import { IRider } from './rider.interface';
import Rider from './rider.model';

const updateRiderProfile = async (userId: string, payload: Partial<IRider>) => {
  const result = await Rider.findOneAndUpdate({ user: userId }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const riderServices = {
  updateRiderProfile,
};

export default riderServices;
