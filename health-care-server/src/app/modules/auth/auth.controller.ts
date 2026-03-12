import type { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthServices } from "./auth.services";

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.login(req.body);
  //   console.log(result);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60, // 1 hour
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 90, // 90 days
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Login Successfully",
    data: {
      needPasswordChange: result.needPasswordChange,
    },
  });
});

export const AuthController = {
  login,
};
