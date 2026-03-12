import type { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserServices } from "./user.services";

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createPatient(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient created successfully",
    data: result,
  });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createDoctor(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor created successfully",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createAdmin(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

export const UserController = {
  createPatient,
  createDoctor,
  createAdmin,
};
