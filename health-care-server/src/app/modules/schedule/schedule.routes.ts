import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { ScheduleController } from "./schedule.controllers";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.DOCTOR),
  ScheduleController.insertIntoDB,
);
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.DOCTOR),
  ScheduleController.schedulesForDoctor,
);
router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.DOCTOR),
  ScheduleController.deleteSchedule,
);

export const scheduleRoutes = router;
