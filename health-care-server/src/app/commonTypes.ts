import { UserRole } from "@prisma/client";

export interface IDoctorUser {
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
export interface IUser {
  email: string;
  role: UserRole;
}
