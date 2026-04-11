import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Request } from "express";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { fileUploader } from "../../utils/fileUploader";
import { paginationHelper } from "../../utils/paginationHelper";
import { IFilters, IOptions } from "./user.interfaces";

const getAllUsers = async (filters: IFilters, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const users = await prisma.user.findMany({
    skip,
    take,
    where: {
      email: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    orderBy: {
      [validSortBy]: validSortOrder,
    },
  });

  return users;
};

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
      data: {
        ...req.body.doctor,
        email: newUser.email,
      },
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
      data: {
        ...req.body.admin,
        email: newUser.email,
      },
    });
  });

  return result;
};

export const UserServices = {
  getAllUsers,
  createPatient,
  createDoctor,
  createAdmin,
};
