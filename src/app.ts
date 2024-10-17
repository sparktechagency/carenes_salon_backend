/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, {
  Application,
  NextFunction,
  Request,
  Response,
  application,
} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
import axios from 'axios';
import { generateToken } from './app/helper/generatePaymentToken';
import { handleStkPush } from './app/helper/handleStkPush';
const app: Application = express();

// parser
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.static('uploads'));
// application routers ----------------
app.use('/api', router);

app.post('/stkpush', generateToken, handleStkPush);

const test = (req: Request, res: Response) => {
  Promise.reject();
  // const a = 10;
  // res.send(a);
};

app.get('/', test);

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
