/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../../utilities/paypalClient';
import * as payoutsSdk from '@paypal/payouts-sdk';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import Booking from '../booking/booking.model';
import payoutsClient from '../../utilities/payoutClient';
import Client from '../client/client.model';
import { ENUM_PAYMENT_STATUS } from '../../utilities/enum';
import config from '../../config';

interface CapturePayload {
  token: string;
  payerId: string;
  salonOwnerEmail: string;
}

const handlePaypalPayment = async (amount: number) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');

  const returnUrl = config.paypal.paypal_return_url;
  const cancelUrl = config.paypal.paypal_cancel_url;

  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          value: amount.toFixed(2),
          currency_code: 'USD',
        },
      },
    ],
    application_context: {
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  });

  try {
    const order = await paypalClient.execute(request);
    const orderId = order.result.id;
    const approvalUrl = order.result.links.find(
      (link: { rel: string; href: string }) => link.rel === 'approve',
    )?.href;

    if (approvalUrl) {
      return { approvalUrl, orderId: orderId };
    } else {
      throw new Error('Failed to retrieve approval URL');
    }
  } catch (error) {
    throw new Error('Failed to create PayPal payment');
  }
};

const capturePaymentForAppointment = async (payload: CapturePayload) => {
  const { token } = payload;

  try {
    const orderDetails = await getOrderDetails(token);

    const orderId = orderDetails.id;
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
    captureRequest.requestBody({});
    const captureResponse = await paypalClient.execute(captureRequest);
    const captureId = captureResponse?.result?.id;
    if (
      !captureResponse.result.purchase_units[0].payments.captures[0].amount
        .value
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid payment data in capture response.',
      );
    }

    const bookingInfo = await Booking.findOne({ orderId: orderId });
    if (!bookingInfo) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found.');
    }

    const shopInfo = await Client.findById(bookingInfo?.shopId);
    if (!shopInfo) {
      throw new AppError(httpStatus.NOT_FOUND, 'Shop not found.');
    }
    // update booking
    await Booking.findByIdAndUpdate(
      bookingInfo._id,
      {
        captureId: captureId,
        paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
      },
      { new: true, runValidators: true },
    );
    return {
      captureId: captureResponse.result.id,
    };
  } catch (captureError) {
    throw new Error('Failed to capture payment.');
  }
};

const getOrderDetails = async (token: string) => {
  const orderRequest = new paypal.orders.OrdersGetRequest(token);

  try {
    const orderResponse = await paypalClient.execute(orderRequest);
    return orderResponse.result;
  } catch (error) {
    throw new Error('Failed to fetch order details.');
  }
};

const transferMoneyToSalonOwner = async (
  salonAmount: number,
  salonOwnerEmail: string,
) => {
  const payoutRequest = new payoutsSdk.payouts.PayoutsPostRequest();
  payoutRequest.requestBody({
    sender_batch_header: {
      sender_batch_id: `Payout-${Date.now()}`,
      email_subject: 'You have received a payment!',
      email_message: 'Thank you for using our service!',
    },
    items: [
      {
        recipient_type: 'EMAIL',
        amount: {
          value: salonAmount.toFixed(2),
          currency: 'EUR',
        },
        receiver: salonOwnerEmail,
        note: 'Payment for your appointment',
      },
    ],
  });

  try {
    const payoutResponse = await payoutsClient.execute(payoutRequest);
    console.log('Payout successful:', payoutResponse.result);
    return payoutResponse.result;
  } catch (error) {
    console.error('Failed to process payout:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to process payout to salon owner.',
    );
  }
};

// interface RefundPayload {
//   captureId: string;
// }

// const refundPayment = async (payload: RefundPayload) => {
//   const { captureId } = payload;

//   try {
//     const captureDetails = await getCaptureDetails(captureId);
//     console.log('capture details:', captureDetails);
//     const totalAmount = parseFloat(captureDetails.amount.value);

//     const refundAmount = totalAmount; // Full refund
//     const adminFee = +(refundAmount * 0.05).toFixed(2);
//     const salonAmount = +(refundAmount - adminFee).toFixed(2);

//     // 1. Refund admin fee
//     await processRefundFromAdmin(adminFee);

//     // 2. Refund salon owner amount
//     await processRefundFromSalon(salonAmount, captureDetails.salonOwnerEmail);

//     return { adminFee, salonAmount };
//   } catch (error) {
//     throw new AppError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       'Refund processing failed',
//     );
//   }
// };

// const processRefundFromAdmin = async (amount: number) => {
//   try {
//     const request = new paypal.payouts.PayoutsPostRequest();
//     request.requestBody({
//       sender_batch_header: {
//         sender_batch_id: `AdminRefund-${Date.now()}`,
//         email_subject: 'Refund from Admin',
//         email_message: 'Refund for the admin fee',
//       },
//       items: [
//         {
//           recipient_type: 'EMAIL',
//           amount: {
//             value: amount.toFixed(2),
//             currency_code: 'USD',
//           },
//           receiver: 'admin@example.com', // Admin's PayPal email
//           note: 'Refund of admin fee',
//         },
//       ],
//     });

//     const response = await payoutsClient.execute(request);
//     console.log('Admin refund successful:', response.result);
//   } catch (error) {
//     throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Admin refund failed');
//   }
// };

// const processRefundFromSalon = async (
//   amount: number,
//   salonOwnerEmail: string,
// ) => {
//   try {
//     const request = new paypal.payouts.PayoutsPostRequest();
//     request.requestBody({
//       sender_batch_header: {
//         sender_batch_id: `SalonRefund-${Date.now()}`,
//         email_subject: 'Refund from Salon Owner',
//         email_message: 'Refund for the service',
//       },
//       items: [
//         {
//           recipient_type: 'EMAIL',
//           amount: {
//             value: amount.toFixed(2),
//             currency_code: 'USD',
//           },
//           receiver: salonOwnerEmail, // Salon owner's PayPal email
//           note: 'Refund of service fee',
//         },
//       ],
//     });

//     const response = await payoutsClient.execute(request);
//     console.log('Salon refund successful:', response.result);
//   } catch (error) {
//     throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Salon refund failed');
//   }
// };

const refundPayment = async (captureId: string, refundAmount: number) => {
  const request = new paypal.payments.CapturesRefundRequest(captureId);

  // Properly set the request body
  request.requestBody({
    amount: {
      value: refundAmount.toFixed(2), // Amount to refund
      currency_code: 'EUR',
    },
    invoice_id: `INV-${Date.now()}`,
    note_to_payer: 'Refund for your booking cancellation.',
  });

  // Execute the refund request
  const response = await paypalClient.execute(request);
  return response.result;
};

// const getCaptureDetails = async (token: string) => {
//   const orderRequest = new paypal.orders.OrdersGetRequest(token);

//   try {
//     const orderResponse = await paypalClient.execute(orderRequest);
//     return orderResponse.result;
//   } catch (error) {
//     throw new Error('Failed to fetch order details.');
//   }
// };

const PaypalService = {
  handlePaypalPayment,
  capturePaymentForAppointment,
  refundPayment,
  transferMoneyToSalonOwner,
};

export default PaypalService;
