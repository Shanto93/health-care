import { NextFunction, Request, Response } from "express";

const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const httpStatus = await import("http-status");

  let statusCode = httpStatus.default.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  res.status(statusCode).json({
    success,
    message,
    error,
  });
};

export default globalErrorHandler;
