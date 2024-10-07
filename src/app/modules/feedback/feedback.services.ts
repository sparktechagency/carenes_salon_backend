import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IFeedback } from './feedback.interface';
import Feedback from './feedback.model';

const createFeedBack = async (userId: string, payload: IFeedback) => {
  const result = await Feedback.create({ ...payload, user: userId });
  return result;
};

// reply feed back
const replyFeedback = async (id: string, replyMessage: string) => {
  const feedback = await Feedback.findById(id);
  if (!feedback) {
    throw new AppError(httpStatus.NOT_FOUND, 'Feedback not found');
  }
  const result = await Feedback.findByIdAndUpdate(
    id,
    {
      replyMessage: replyMessage,
    },
    { new: true, runValidators: true },
  );
  return result;
};

const feedbackService = {
  createFeedBack,
  replyFeedback,
};

export default feedbackService;
