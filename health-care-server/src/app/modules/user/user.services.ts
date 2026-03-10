import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import type { ICreatePatientRequest } from "./user.interfaces";

const createPatient = async (payload: ICreatePatientRequest) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const result = await prisma.$transaction(async (tnx) => {
    // Create the User
    const newUser = await tnx.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
      },
    });

    // Create the Patient profile
    return await tnx.patient.create({
      data: {
        email: newUser.email,
        name: payload.name,
        contactNumber: payload.contactNumber,
        profilePhoto: payload.profilePhoto,
        address: payload.address,
      },
    });
  });

  return result;
};

export const UserServices = {
  createPatient,
};
