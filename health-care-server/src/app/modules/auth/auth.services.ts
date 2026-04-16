import { UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Secret, SignOptions } from "jsonwebtoken";
import config from "../../../config";
import AppError from "../../middlewares/AppError";
import { prisma } from "../../shared/prisma";
import { generateToken } from "../../utils/generateToken";
import { IAuthInfo } from "./auth.interfaces";

const login = async (payload: IAuthInfo) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const needPasswordChange = user.needPasswordChange;

  // 2. Verify password
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(400, "Invalid password");
  }

  // 3. Generate JWT Tokens
  const jwtPayload = { email: user.email, role: user.role };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expiration as SignOptions["expiresIn"],
  );

  const refreshToken = generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expiration as SignOptions["expiresIn"],
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange,
  };
};

export const AuthServices = {
  login,
};
