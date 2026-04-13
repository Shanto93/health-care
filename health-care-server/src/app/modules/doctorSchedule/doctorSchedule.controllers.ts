import { Request, Response } from "express";
import { IDoctorUser } from "../../commonTypes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DoctorScheduleServices } from "./doctorSchedule.services";

const insertIntoDB = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as IDoctorUser; 
    
    const result = await DoctorScheduleServices.insertIntoDB(user, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Schedule assigned to Doctor successfully!",
      // Add the meta object with the count of inserted records
      meta: {
        count: result.length, 
      },
      data: result,
    });
  },
);

export const DoctorScheduleController = {
  insertIntoDB,
};