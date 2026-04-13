import express from "express";
import { ScheduleController } from "./schedule.controllers";

const router = express.Router();

router.post("/", ScheduleController.insertIntoDB);
router.get("/", ScheduleController.schedulesForDoctor);
router.delete("/:id", ScheduleController.deleteSchedule);

export const scheduleRoutes = router;
