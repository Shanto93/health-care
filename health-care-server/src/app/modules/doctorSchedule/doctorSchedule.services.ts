import { IDoctorUser } from "../../commonTypes";
import AppError from "../../middlewares/AppError";
import { prisma } from "../../shared/prisma";
import { IAssignSchedulePayload } from "./doctorSchedule.interface";

const insertIntoDB = async (
  user: IDoctorUser,
  payload: IAssignSchedulePayload,
) => {
  // 1. Fetch the Doctor's ID (Throws P2025 -> 404 automatically if not found)
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  // 2. Pre-emptive Duplicate Check
  // Check if the doctor is ALREADY assigned to ANY of the provided scheduleIds
  const existingSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctorId: doctorInfo.id,
      scheduleId: {
        in: payload.scheduleIds,
      },
    },
  });

  // 3. Graceful Error Handling
  if (existingSchedules.length > 0) {
    // ELITE FIX: Using 409 CONFLICT instead of a generic 500 error crash
    throw new AppError(
      409,
      "Conflict: You have already assigned yourself to one or more of these schedule slots. Please refresh and try again.",
    );
  }

  // 4. Prepare Payload
  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorInfo.id,
    scheduleId,
  }));

  // 5. Bulk Insert with Race-Condition Protection
  await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
    skipDuplicates: true, // Secondary failsafe in case of extreme high-concurrency (double clicks)
  });

  // 6. Return the structured data back to the frontend instead of `{ count: x }`
  return doctorScheduleData;
};

export const DoctorScheduleServices = {
  insertIntoDB,
};
