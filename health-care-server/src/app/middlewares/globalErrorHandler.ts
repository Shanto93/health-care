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
  let statusCode = 500; // INTERNAL_SERVER_ERROR
  let message = "Something went wrong!";
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
  // 3. Handle Prisma Known Errors (e.g., Duplicates, Not Found)
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409; // CONFLICT
      message = "Duplicate Key Error. A record with this value already exists.";
      errorDetails = err.meta;
    } else if (err.code === "P2025") {
      statusCode = 404; // NOT_FOUND
      message = "Record Not Found.";
      errorDetails = err.meta;
    } else {
      statusCode = 400; // BAD_REQUEST
      message = "Database Query Error";
    }
  }
  // 4. Handle Prisma Validation Errors (Malformed data to DB)
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400; // BAD_REQUEST
    message = "Database Validation Error. Please check your data format.";
  }
  // 5. Handle Custom App Errors
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // 6. Handle Standard Generic Errors
  else if (err instanceof Error) {
    message = err.message;
  }

  // 7. Send the Response
  res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails,
    stack: config.node_env === "development" ? err?.stack : null,
  });
};

export default globalErrorHandler;

// ----------------------old code------------------

// import { NextFunction, Request, Response } from "express";

// const globalErrorHandler = async (
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const httpStatus = await import("http-status");

//   let statusCode = httpStatus.default.INTERNAL_SERVER_ERROR;
//   let success = false;
//   let message = err.message || "Something went wrong!";
//   let error = err;

//   res.status(statusCode).json({
//     success,
//     message,
//     error,
//   });
// };

// export default globalErrorHandler;

// ------------------------very new code--------------------

// import { Prisma } from "@prisma/client";
// import { ErrorRequestHandler } from "express";
// import { ZodError } from "zod";
// import config from "../../config";
// import AppError from "./AppError";

// // ---------------------------------------------------------
// // 1. STANDARD INTERFACE (The Contract with the Frontend)
// // ---------------------------------------------------------
// export type TErrorSources = {
//   path: string | number;
//   message: string;
// }[];

// // ---------------------------------------------------------
// // 2. MODULAR ERROR HANDLERS
// // ---------------------------------------------------------

// // A. Handle Zod Validations
// const handleZodError = (err: ZodError) => {
//   const errorSources: TErrorSources = err.issues.map((issue) => ({
//     path: String(issue?.path[issue.path.length - 1]),
//     message: issue.message,
//   }));
//   return {
//     statusCode: 400,
//     message: "Validation Error",
//     errorSources,
//   };
// };

// // B. Handle Prisma Database Errors
// const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError) => {
//   let statusCode = 400;
//   let message = "Database Error";
//   let errorSources: TErrorSources = [
//     { path: "", message: "Database query failed" },
//   ];

//   if (err.code === "P2002") {
//     statusCode = 409;
//     message = "Duplicate Entry";
//     errorSources = [
//       {
//         path: err.meta?.target ? (err.meta.target as string[])[0] : "unknown",
//         message: "A record with this value already exists.",
//       },
//     ];
//   } else if (err.code === "P2025") {
//     statusCode = 404;
//     message = "Not Found";
//     errorSources = [
//       { path: "", message: "The requested record was not found." },
//     ];
//   } else if (err.code === "P2014") {
//     statusCode = 400;
//     message = "Relation Violation";
//     errorSources = [
//       {
//         path: "",
//         message:
//           "Cannot delete this record because it is linked to other data.",
//       },
//     ];
//   }

//   return { statusCode, message, errorSources };
// };

// // C. Handle Prisma Validation/Formatting Errors
// const handlePrismaValidationError = (
//   err: Prisma.PrismaClientValidationError,
// ) => {
//   return {
//     statusCode: 400,
//     message: "Database Validation Error",
//     errorSources: [
//       { path: "", message: "Invalid data format sent to the database." },
//     ],
//   };
// };

// // ---------------------------------------------------------
// // 3. THE MAIN ORCHESTRATOR
// // ---------------------------------------------------------
// const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
//   // Default values
//   let statusCode = 500;
//   let message = "Something went wrong!";
//   let errorSources: TErrorSources = [
//     {
//       path: "",
//       message: "Internal Server Error",
//     },
//   ];

//   // Route the error to the correct modular handler
//   if (err instanceof ZodError) {
//     const simplifiedError = handleZodError(err);
//     statusCode = simplifiedError.statusCode;
//     message = simplifiedError.message;
//     errorSources = simplifiedError.errorSources;
//   } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
//     const simplifiedError = handlePrismaError(err);
//     statusCode = simplifiedError.statusCode;
//     message = simplifiedError.message;
//     errorSources = simplifiedError.errorSources;
//   } else if (err instanceof Prisma.PrismaClientValidationError) {
//     const simplifiedError = handlePrismaValidationError(err);
//     statusCode = simplifiedError.statusCode;
//     message = simplifiedError.message;
//     errorSources = simplifiedError.errorSources;
//   } else if (err instanceof AppError) {
//     statusCode = err.statusCode;
//     message = err.message;
//     errorSources = [{ path: "", message: err.message }];
//   }
//   // Handle JWT Auth Errors natively
//   else if (err.name === "TokenExpiredError") {
//     statusCode = 401;
//     message = "Unauthorized access";
//     errorSources = [
//       {
//         path: "token",
//         message: "Your session has expired. Please log in again.",
//       },
//     ];
//   } else if (err.name === "JsonWebTokenError") {
//     statusCode = 401;
//     message = "Unauthorized access";
//     errorSources = [
//       { path: "token", message: "Invalid authentication token." },
//     ];
//   }
//   // Fallback for standard Node.js Errors
//   else if (err instanceof Error) {
//     message = err.message;
//     errorSources = [{ path: "", message: err.message }];
//   }

//   // Final Response Payload
//   res.status(statusCode).json({
//     success: false,
//     message,
//     errorSources,
//     // Only leak the stack trace in development mode
//     stack: config.node_env === "development" ? err?.stack : null,
//   });
// };

// export default globalErrorHandler;
