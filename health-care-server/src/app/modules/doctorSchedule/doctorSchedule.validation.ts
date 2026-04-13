import { z } from "zod";

const assignScheduleValidation = z.object({
  body: z.object({
    scheduleIds: z
      .array(
        z
          .string({
            message: "Schedule ID must be a string",
          })
          .uuid("Invalid Schedule ID format. Each ID must be a valid UUID."),
      )
      .nonempty("You must provide at least one Schedule ID to assign."),
  }),
});

export const DoctorScheduleValidation = {
  assignScheduleValidation,
};
