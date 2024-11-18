export const ENUM_PRODUCT_STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
} as const;

export const ENUM_SHOP_TYPE = {
  RESTAURANT: 'Restaurant',
  GROCERY: 'Grocery',
};
export const ENUM_SHOP_STATUS = {
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
};

export const ENUM_ORDER_STATUS = {
  PENDING: 'pending',
  CANCELED: 'canceled',
  ACCEPTED: 'accepted',
  PICKED: 'picked',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
};

export const ENUM_GENDER = {
  MALE: 'Male',
  FEMALE: 'Female',
};

export const ENUM_PAYMENT_PREFERENCES = {
  ONLINE_ONLY: 'online-only',
  CASH_ONLY: 'cash-only',
  BOTH: 'both',
};


export const ENUM_NOTIFICATION_TYPE={
  BOOKING: 'booking',
  CANCEL_BOOKING: 'cancel-booking',
  RESCHEDULE_BOOKING: 'reschedule-booking',
  START_BOOKING:"start-booking",
  REGISTER_CLIENT:"register-client"
}


export const ENUM_BOOKING_PAYMENT = {
  ONLINE: 'online',
  PAY_ON_SHOP:"pay-on-shop"
}

