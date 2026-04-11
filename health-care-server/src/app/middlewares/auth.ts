import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { verifyToken } from "../utils/generateToken";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction,
  ) => {
    // 1. Get token from header
    try {
      const token = req.cookies.get.accessToken || req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new Error("Unauthorized: No token provided");
      }
      // 2. Verify token

      const verifyUser = verifyToken(
        token,
        config.jwt.access_token_secret as string,
      );

      if (!verifyUser) {
        throw new Error("Unauthorized: Invalid token");
      }

      req.user = verifyUser;

      // 3. Check if user role is allowed
      if (roles.length > 0 && !roles.includes((verifyUser as any)?.role)) {
        throw new Error(
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
