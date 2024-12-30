/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../../utilities/paypalClient';
import * as payoutsSdk from '@paypal/payouts-sdk';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import Booking from '../booking/booking.model';
import payoutsClient from '../../utilities/payoutClient';

interface CapturePayload {
  token: string;
  payerId: string;
  salonOwnerEmail: string;
}

const handlePaypalPayment = async (amount: number) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');

  const returnUrl = 'https://your-site.com/payment-success';
  const cancelUrl = 'https://your-site.com/payment-cancel';

  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          value: amount.toFixed(2), // Format amount to two decimals
          currency_code: 'USD', // Currency (change as per your need)
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
    console.log('capture id', captureId);
    if (
      !captureResponse.result.purchase_units[0].payments.captures[0].amount
        .value
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid payment data in capture response.',
      );
    }
    const totalAmount = parseFloat(
      captureResponse.result.purchase_units[0].payments.captures[0].amount
        .value,
    );
    const adminFee = +(totalAmount * 0.05).toFixed(2);
    const salonAmount = +(totalAmount - adminFee).toFixed(2);

    // console.log(
    //   `Payment captured: Total = ${totalAmount}, Admin Fee = ${adminFee}, Salon Amount = ${salonAmount}`,
    // );

    const bookingInfo = await Booking.findOne({ orderId: orderId });
    if (!bookingInfo) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found.');
    }

    const salonOwnerEmail = 'sb-h6qip32749974@personal.example.com';
    // process payouts
    await processPayout(salonAmount, salonOwnerEmail);

    // await processTransfer(salonAmount, 'sb-h6qip32749974@personal.example.com');
    // console.log('successfull transfer');
    return {
      captureId: captureResponse.result.id,
      salonAmount,
      adminFee,
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

// const processTransfer = async (
//   salonAmount: number,
//   salonOwnerEmail: string,
// ) => {
//   // PayPal Transfer (Send Money) request
//   const request = new paypal.payment.PaymentCreateRequest();
//   request.prefer('return=representation');

//   request.requestBody({
//     intent: 'sale', // Intent to complete a sale
//     payer: {
//       payment_method: 'paypal', // PayPal payment method
//     },
//     transactions: [
//       {
//         amount: {
//           total: salonAmount.toFixed(2), // Total amount for the transaction
//           currency: 'USD', // Currency for the transaction
//         },
//         payee: {
//           email: salonOwnerEmail, // Payee's email address
//         },
//         description: 'Payment for appointment', // Description of the transaction
//       },
//     ],
//     redirect_urls: {
//       return_url: 'https://your-site.com/payment-success', // Where to redirect on success
//       cancel_url: 'https://your-site.com/payment-cancel', // Where to redirect on failure
//     },
//   });

//   try {
//     // Execute the payment request
//     const paymentResponse = await paypalClient.execute(request);

//     // Check if the payment was successful
//     if (paymentResponse.result.state === 'approved') {
//       console.log('Payment transfer successful:', paymentResponse.result);
//       return paymentResponse.result;
//     } else {
//       throw new Error('Payment not approved');
//     }
//   } catch (error) {
//     console.error('Failed to process payment transfer:', error);
//     throw new AppError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       'Failed to process payment transfer.',
//     );
//   }
// };

const processPayout = async (salonAmount: number, salonOwnerEmail: string) => {
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
          currency: 'USD',
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

interface RefundPayload {
  captureId: string;
}

// const refundPayment = async (payload: RefundPayload) => {
//   const { captureId } = payload;

//   const refundAmount = 100;

//   try {
//     const request = new paypal.payments.CapturesRefundRequest(captureId);
//     request.requestBody({
//       amount: {
//         value: refundAmount.toFixed(2),
//         currency_code: 'USD',
//       },
//       invoice_id: `Refund-${Date.now()}`,
//       note_to_payer: 'Refund for your appointment',
//     });

//     const response = await paypalClient.execute(request);
//     console.log('Refund successful:', response.result);
//     return response.result;
//   } catch (error) {
//     throw new Error('Failed to process refund');
//   }
// };

// another try--------------------

const refundPayment = async (payload: RefundPayload) => {
  const { captureId } = payload;

  try {
    const captureDetails = await getCaptureDetails('2K644146XB114024F');
    console.log('capture details:', captureDetails);
    const totalAmount = parseFloat(captureDetails.amount.value);

    const refundAmount = totalAmount; // Full refund
    const adminFee = +(refundAmount * 0.05).toFixed(2);
    const salonAmount = +(refundAmount - adminFee).toFixed(2);

    // 1. Refund admin fee
    await processRefundFromAdmin(adminFee);

    // 2. Refund salon owner amount
    await processRefundFromSalon(salonAmount, captureDetails.salonOwnerEmail);

    return { adminFee, salonAmount };
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Refund processing failed',
    );
  }
};

const processRefundFromAdmin = async (amount: number) => {
  try {
    const request = new paypal.payouts.PayoutsPostRequest();
    request.requestBody({
      sender_batch_header: {
        sender_batch_id: `AdminRefund-${Date.now()}`,
        email_subject: 'Refund from Admin',
        email_message: 'Refund for the admin fee',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount.toFixed(2),
            currency_code: 'USD',
          },
          receiver: 'admin@example.com', // Admin's PayPal email
          note: 'Refund of admin fee',
        },
      ],
    });

    const response = await payoutsClient.execute(request);
    console.log('Admin refund successful:', response.result);
  } catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Admin refund failed');
  }
};

const processRefundFromSalon = async (
  amount: number,
  salonOwnerEmail: string,
) => {
  try {
    const request = new paypal.payouts.PayoutsPostRequest();
    request.requestBody({
      sender_batch_header: {
        sender_batch_id: `SalonRefund-${Date.now()}`,
        email_subject: 'Refund from Salon Owner',
        email_message: 'Refund for the service',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount.toFixed(2),
            currency_code: 'USD',
          },
          receiver: salonOwnerEmail, // Salon owner's PayPal email
          note: 'Refund of service fee',
        },
      ],
    });

    const response = await payoutsClient.execute(request);
    console.log('Salon refund successful:', response.result);
  } catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Salon refund failed');
  }
};
const getCaptureDetails = async (token: string) => {
  const orderRequest = new paypal.orders.OrdersGetRequest(token);

  try {
    const orderResponse = await paypalClient.execute(orderRequest);
    return orderResponse.result;
  } catch (error) {
    throw new Error('Failed to fetch order details.');
  }
};
// const getCaptureDetails = async (captureId: string) => {
//   const captureRequest = new paypal.payments.CapturesGetRequest(captureId);

//   try {
//     // Execute the request to fetch capture details
//     const captureResponse = await paypalClient.execute(captureRequest);

//     // Log or handle the raw response if needed for debugging
//     console.log('Capture Details:', captureResponse.result);

//     return captureResponse.result;
//   } catch (error) {
//     console.error('Failed to fetch capture details:', error);
//     throw new Error('Failed to fetch capture details.');
//   }
// };

const createPayment = async (amount: number) => {
  //   const { amount, salonOwnerEmail, adminEmail } = payload;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');

  // Define return and cancel URLs
  const returnUrl = 'https://your-site.com/payment-success';
  const cancelUrl = 'https://your-site.com/payment-cancel';

  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          value: amount.toFixed(2),
          currency_code: 'USD',
        },
        payee: {
          email_address: salonOwnerEmail, // Payment goes to the salon owner
        },
        payment_instruction: {
          disbursement_mode: 'INSTANT', // Instant payment to salon owner
          transfer_fee: {
            value: (amount * 0.05).toFixed(2),
            currency_code: 'USD',
          },
          // This will deduct the 5% from the payment and transfer it to the platform
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
    const approvalUrl = order.result.links.find(
      (link: { rel: string; href: string }) => link.rel === 'approve',
    )?.href;

    if (approvalUrl) {
      return { approvalUrl, orderId: order.result.id };
    } else {
      throw new Error('Failed to retrieve approval URL');
    }
  } catch (error) {
    throw new Error('Failed to create PayPal payment');
  }
};

const PaypalService = {
  handlePaypalPayment,
  capturePaymentForAppointment,
  refundPayment,
};

export default PaypalService;
