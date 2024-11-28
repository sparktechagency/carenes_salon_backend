/* eslint-disable @typescript-eslint/no-explicit-any */
import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../../utilities/paypalClient';
const handlePaypalPayment = async (payload: any) => {
  const { appointmentId, amount, salonOwnerEmail } = payload;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
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
  });

  const order = await paypalClient.execute(request);

  // Save appointment details in your database

  return order.result.id;
};

const PaypalService = {
  handlePaypalPayment,
};

export default PaypalService;
