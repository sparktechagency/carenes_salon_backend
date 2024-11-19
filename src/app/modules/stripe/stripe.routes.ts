import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import stripeController from "./stripe.controller";


const router = express.Router();


router.post("/create-onboarding-link",auth(USER_ROLE.client),stripeController.createOnboardingLink);


export const stripeRoutes = router;