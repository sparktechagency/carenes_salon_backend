import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  base_url: process.env.BASE_URL,
  default_pass: process.env.DEFAULT_PASS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  reset_password_ui_link: process.env.RESET_PASSWORD_UI_LINK,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  stripe: {
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    webhook_endpoint_secret: process.env.WEBHOOK_ENDPOINT_SECRET,
    onboarding_return_url: process.env.ONBOARDING_RETURN_URL,
    onboarding_refresh_url: process.env.ONBOARDING_REFRESH_URL,
    admin_fee_payment_success_url: process.env.ADMIN_FEE_PAYMENT_SUCCESS_URL,
    payment_cancel_url: process.env.PAYPAL_CANCEL_URL,
    booking_payment_success_url: process.env.BOOKING_PAYMENT_SUCCESS_URL,
  },
  // twilio for sms -------------
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  // smtp for email -------------
  smtp: {
    smtp_host: process.env.SMTP_HOST,
    smtp_port: process.env.SMTP_PORT,
    smtp_service: process.env.SMTP_SERVICE,
    smtp_mail: process.env.SMTP_MAIL,
    smtp_pass: process.env.SMTP_PASS,
    name: process.env.SERVICE_NAME,
  },
  // paypal -------------
  paypal: {
    platform_email: process.env.PAYPAL_PLATFORM_EMAIL,
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
    paypal_return_url: process.env.PAYPAL_RETURN_URL,
    paypal_cancel_url: process.env.PAYPAL_CANCEL_URL,
    paypal_return_url_for_amdin_fee:
      process.env.PAYPAL_RETURN_URL_FOR_ADMIN_FEE,
    paypal_cancel_url_for_admin_fee:
      process.env.PAYPAL_CANCEL_URL_FOR_ADMIN_FEE,
  },
};
