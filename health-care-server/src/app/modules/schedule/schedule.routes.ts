import express from "express";
import { ScheduleController } from "./schedule.controllers";

const router = express.Router();

router.post("/", ScheduleController.insertIntoDB);

export const scheduleRoutes = router;
