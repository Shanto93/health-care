import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Request } from "express";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { fileUploader } from "../../utils/fileUploader";

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadResult;
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    config.bcrypt.salt_rounds,
  );
  const result = await prisma.$transaction(async (tnx) => {
    // Create the User
    const newUser = await tnx.user.create({
      data: {
        email: req.body.patient.email,
        password: hashedPassword,
        role: UserRole.PATIENT,
      },
    });

    // Create the Patient profile
    return await tnx.patient.create({
      data: req.body.patient,
    });
  });

  return result;
};

const createDoctor = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.doctor.profilePhoto = uploadResult;
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    config.bcrypt.salt_rounds,
  );
  const result = await prisma.$transaction(async (tnx) => {
    // Create the User
    const newUser = await tnx.user.create({
      data: {
        email: req.body.doctor.email,
        password: hashedPassword,
        role: UserRole.DOCTOR,
      },
    });

    // Create the Doctor profile
    return await tnx.doctor.create({
      data: req.body.doctor,
    });
  });

  return result;
};

const createAdmin = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.admin.profilePhoto = uploadResult;
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    config.bcrypt.salt_rounds,
  );
  const result = await prisma.$transaction(async (tnx) => {
    // Create the User
    const newUser = await tnx.user.create({
      data: {
        email: req.body.admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });

    // Create the Admin profile
    return await tnx.admin.create({
      data: req.body.admin,
    });
  });

  return result;
};

export const UserServices = {
  createPatient,
  createDoctor,
  createAdmin,
};
