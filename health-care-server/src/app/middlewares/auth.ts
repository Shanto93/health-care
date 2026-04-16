import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { verifyToken } from "../utils/generateToken";
import AppError from "./AppError";

const auth = (...roles: string[]) => {
  return async (
    req: Request, // ELITE FIX: Relying on global.d.ts, no need for custom intersections!
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // 1. Get token from header or cookies
      const token =
        req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

      if (!token) {
        // 401 UNAUTHORIZED: The user has not provided authentication credentials
        throw new AppError(401, "Unauthorized: No token provided");
      }

      // 2. Verify token
      // Note: If the token is expired or malformed, jsonwebtoken will throw its own
      // specific errors (TokenExpiredError, etc.) which our globalErrorHandler already catches!
      const verifyUser = verifyToken(
        token,
        config.jwt.access_token_secret as string,
      );

      if (!verifyUser) {
        throw new AppError(401, "Unauthorized: Invalid token");
      }

      // Attach the verified user to the request object
      req.user = verifyUser;

      // 3. Check if user role is allowed
      if (roles.length > 0 && !roles.includes((verifyUser as any)?.role)) {
        // 403 FORBIDDEN: The user is authenticated, but their specific role isn't allowed here
        throw new AppError(
          403,
          "Forbidden: You don't have permission to access this resource",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
