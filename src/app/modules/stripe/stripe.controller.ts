import catchAsync from "../../utilities/catchasync";
import sendResponse from "../../utilities/sendResponse";
import stripeServices from "./stripe.services";

const createOnboardingLink = catchAsync(async (req, res) => {
    const result = await stripeServices.createConnectedAccountAndOnboardingLink(
      req.user.email,
      req.user.profileId
    );
  
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Link created successfully',
      data: result,
    });
  });


const stripeController = {
    createOnboardingLink
}


export default stripeController;