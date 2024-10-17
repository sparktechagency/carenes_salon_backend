import nodemailer from 'nodemailer';
import config from '../config';
export const sendEmail = async (to: string, subject: string, html: string) => {
  console.log('receiver email', to);
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: config.NODE_ENV === 'production',
    auth: {
      //   TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'thakursaad613@gmail.com',
      pass: 'votmjvpvypngsiuk',
    },
  });
  await transporter.sendMail({
    from: 'thakursaad613@gmail.com', // sender address
    to, // list of receivers
    subject: subject, // Subject line
    text: '', // plain text body
    html, // html body
  });
};
