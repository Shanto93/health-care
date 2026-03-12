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
  }),
});

export const UserValidation = {
  createPatientValidation,
};
