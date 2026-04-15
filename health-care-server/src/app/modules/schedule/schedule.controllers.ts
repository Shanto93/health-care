import type { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import pick from "../../utils/pick";
import {
  scheduleFilterableFields,
  scheduleOptionsFields,
} from "./schedule.constant";
import { ScheduleServices } from "./schedule.services";

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleServices.insertIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule Created Successfully!",
    data: result,
  });
});

const schedulesForDoctor = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const filters = pick(req.query, scheduleFilterableFields);
  const options = pick(req.query, scheduleOptionsFields);

  const result = await ScheduleServices.schedulesForDoctor(
    user,
    filters,
    options,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule Retrieved Successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleServices.deleteSchedule(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule Deleted Successfully!",
    data: result,
  });
});

export const ScheduleController = {
  insertIntoDB,
  schedulesForDoctor,
  deleteSchedule,
};
