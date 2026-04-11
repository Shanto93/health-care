import type { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserServices } from "./user.services";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, searchTerm, sortBy, sortOrder } = req.query;

  const parsedPage = page ? Number(page) : undefined;
  const parsedLimit = limit ? Number(limit) : undefined;

  const result = await UserServices.getAllUsers({
    page: parsedPage,
    limit: parsedLimit,
    searchTerm: searchTerm as string | undefined, 
    sortBy: sortBy as string | undefined,
    sortOrder: sortOrder as string | undefined,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

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
  getAllUsers,
  createPatient,
  createDoctor,
  createAdmin,
};
