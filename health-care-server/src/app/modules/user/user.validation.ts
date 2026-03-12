import { Gender } from "@prisma/client";
import z from "zod";

const createPatientValidation = z.object({
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(12, "Password must be less than 12 characters"),
  patient: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(50, "Name must be less than 50 characters"),
    email: z.email("Invalid email address"),
    contactNumber: z.string(),
    address: z.string().optional(),
    role: z.enum(["PATIENT"]).default("PATIENT"),
  }),
});

const createDoctorValidation = z.object({
  password: z.string({
    error: "Password is required",
  }),
  doctor: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    email: z.string({
      error: "Email is required!",
    }),
    contactNumber: z.string({
      error: "Contact Number is required!",
    }),
    address: z.string().optional(),
    registrationNumber: z.string({
      error: "Reg number is required",
    }),
    experience: z.number().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    appointmentFee: z.number({
      error: "appointment fee is required",
    }),
    role: z.enum(["DOCTOR"]).default("DOCTOR"),
    qualification: z.string({
      error: "quilification is required",
    }),
    currentWorkingPlace: z.string({
      error: "Current working place is required!",
    }),
    designation: z.string({
      error: "Designation is required!",
    }),
  }),
});

const createAdminValidation = z.object({
  password: z.string({
    error: "Password is required",
  }),
  admin: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    email: z.string({
      error: "Email is required!",
    }),
    contactNumber: z.string({
      error: "Contact Number is required!",
    }),
    expertise: z.string("Expertise is required!").optional(),
    role: z.enum(["ADMIN"]).default("ADMIN"),
  }),
});

export const UserValidation = {
  createPatientValidation,
  createDoctorValidation,
  createAdminValidation,
};
