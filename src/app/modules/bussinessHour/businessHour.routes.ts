

import express from "express";
import BusinessHourController from "./businessHour.controller";

const router = express.Router();

router.get("/get-available-dates",BusinessHourController.getAvailableDates);


export const businessHourRoutes = router;