import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import config from "../../config";
import AppError from "./AppError";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Default Values
  let statusCode = err.statusCode || 500; // INTERNAL_SERVER_ERROR
  let message = err.message || "Something went wrong!";
  let errorDetails = err;

  // 2. Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400; // BAD_REQUEST
    message = "Validation Error";
    errorDetails = err.issues.map((issue) => ({
      field: issue.path[issue.path.length - 1],
      message: issue.message,
    }));
  }
  // 3. Handle Prisma Known Errors (Data & Infrastructure)
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      // --- Data Integrity Errors ---
      case "P2002":
        statusCode = 409; // CONFLICT
        message =
          "Duplicate Key Error. A record with this value already exists.";
        errorDetails = err.meta;
        break;
      case "P2025":
        statusCode = 404; // NOT_FOUND
        message = "Record Not Found.";
        errorDetails = err.meta;
        break;

      // --- Infrastructure & Connection Errors ---
      case "P1000":
        statusCode = 500;
        message =
          "Database Authentication Failed. Please check your credentials.";
        break;
      case "P1001":
        statusCode = 503; // SERVICE_UNAVAILABLE
        message = "Cannot reach the Database Server. It might be offline.";
        break;
      case "P1002":
        statusCode = 504; // GATEWAY_TIMEOUT
        message = "Database Server Connection Timed Out.";
        break;
      case "P1003":
        statusCode = 500;
        message = "Target Database Does Not Exist.";
        break;
      case "P1008":
        statusCode = 408; // REQUEST_TIMEOUT
        message = "Database Operation Timed Out.";
        break;
      case "P1009":
        statusCode = 500;
        message = "Database Already Exists.";
        break;
      case "P1010":
        statusCode = 403; // FORBIDDEN
        message = "User Denied Access to Database.";
        break;
      case "P1011":
        statusCode = 500;
        message = "TLS Connection Error with Database.";
        break;
      case "P1012":
        statusCode = 500;
        message = "Prisma Schema Validation Error.";
        break;

      // --- Fallback for other Known Errors ---
      default:
        statusCode = 400; // BAD_REQUEST
        message = `Database Query Error (Code: ${err.code})`;
        errorDetails = err.meta;
    }
  }
  // 4. Handle Prisma Validation Errors (Malformed data to DB)
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400; // BAD_REQUEST
    message = "Database Validation Error. Please check your data format.";
  }
  // 5. Handle Prisma Engine & Infrastructure Crashes
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    message =
      "Failed to initialize Prisma Client (Possible database connection limits reached).";
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    message =
      "A critical engine error occurred in Prisma. The query engine panicked.";
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = "An unknown error occurred during the database request.";
  }
  // 6. Handle Custom App Errors
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // 7. Handle Standard Generic Errors
  else if (err instanceof Error) {
    message = err.message;
  }

  // 8. Send the Response
  res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails,
    stack: config.node_env === "development" ? err?.stack : null,
  });
};

export default globalErrorHandler;
