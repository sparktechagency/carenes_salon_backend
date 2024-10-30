

import express from "express";
import BusinessHourController from "./businessHour.controller";

const router = express.Router();

router.get("/get-available-dates",BusinessHourController.getAvailableDates);
router.get("/get-available-slots",BusinessHourController.getAvailableSlots);


export const businessHourRoutes = router;