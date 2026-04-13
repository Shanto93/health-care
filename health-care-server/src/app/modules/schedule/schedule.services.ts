import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { paginationHelper } from "../../utils/paginationHelper";
import { IOptions } from "../user/user.interfaces";
import { IScheduleFilters, ISchedulePayload } from "./schedule.interface";

const insertIntoDB = async (payload: ISchedulePayload) => {
  const { startTime, endTime, startDate, endDate } = payload;
  const interval = 30;
  const intervalMs = interval * 60 * 1000;

  // 1. Force dates to exact UTC midnight to bypass local timezone
  let currentDate = new Date(`${startDate}T00:00:00.000Z`);
  const lastDate = new Date(`${endDate}T00:00:00.000Z`);

  const schedulesToInsert = [];

  while (currentDate <= lastDate) {
    const currentDateStr = currentDate.toISOString().split("T")[0];

    const startDateTimeOfDay = new Date(
      `${currentDateStr}T${startTime}:00.000Z`,
    );
    const endDateTimeOfDay = new Date(`${currentDateStr}T${endTime}:00.000Z`);

    let currentSlotTime = new Date(startDateTimeOfDay);

    while (currentSlotTime < endDateTimeOfDay) {
      const slotStartDateTime = new Date(currentSlotTime);
      const slotEndDateTime = new Date(
        slotStartDateTime.getTime() + intervalMs,
      );

      schedulesToInsert.push({
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
      });

      currentSlotTime = slotEndDateTime;
    }

    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  // 2. Check for ANY existing conflicts
  const existingSchedules = await prisma.schedule.findMany({
    where: {
      OR: schedulesToInsert.map((schedule) => ({
        startDateTime: schedule.startDateTime,
        endDateTime: schedule.endDateTime,
      })),
    },
  });

  if (existingSchedules.length > 0) {
    const conflict = existingSchedules[0];
    const conflictStart = conflict.startDateTime
      .toISOString()
      .replace("T", " ")
      .substring(0, 16);
    const conflictEnd = conflict.endDateTime
      .toISOString()
      .replace("T", " ")
      .substring(0, 16);

    throw new Error(
      `Schedule conflict detected. Slot already exists for ${conflictStart} - ${conflictEnd}`,
    );
  }

  // 3. Bulk insert all slots safely
  await prisma.schedule.createMany({
    data: schedulesToInsert,
    skipDuplicates: true,
  });

  // 4. Fetch the newly created records from PostgreSQL to get the IDs and timestamps
  const createdSchedules = await prisma.schedule.findMany({
    where: {
      OR: schedulesToInsert.map((schedule) => ({
        startDateTime: schedule.startDateTime,
        endDateTime: schedule.endDateTime,
      })),
    },
    orderBy: {
      startDateTime: "asc",
    },
  });

  // Return the full database objects to the controller
  return createdSchedules;
};

const schedulesForDoctor = async (
  filters: IScheduleFilters,
  options: IOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { startDateTime, endDateTime } = filters;

  const andConditions: Prisma.ScheduleWhereInput[] = [];

  if (startDateTime && endDateTime) {
    andConditions.push({
      AND: [
        {
          startDateTime: {
            gte: startDateTime,
          },
        },
        {
          endDateTime: {
            lte: endDateTime,
          },
        },
      ],
    });
  }

  const whereCondition: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const schedules = await prisma.schedule.findMany({
    skip,
    take: limit,
    where: whereCondition,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.schedule.count({ where: whereCondition });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: schedules,
  };
};

const deleteSchedule = async (scheduleId: string) => {
  return await prisma.schedule.delete({
    where: {
      id: scheduleId,
    },
  });
};

export const ScheduleServices = {
  insertIntoDB,
  schedulesForDoctor,
  deleteSchedule,
};

// ---------------------------- old code -----------------------------

// import { addHours, addMinutes, format } from "date-fns";
// import { prisma } from "../../shared/prisma";
// import { ISchedulePayload } from "./schedule.interface";

// const insertIntoDB = async (payload: ISchedulePayload) => {
//   const { startTime, endTime, startDate, endDate } = payload;

//   const interval = 30; // 30 minutes
//   const schedules = [];

//   const currentDate = new Date(startDate);
//   const lastDate = new Date(endDate);

//   while (currentDate <= lastDate) {
//     const startDateTimeOfDay = new Date(
//       addMinutes(
//         addHours(
//           `${format(currentDate, "yyyy-MM-dd")}`,
//           Number(startTime.split(":")[0]),
//         ),
//         parseInt(startTime.split(":")[1]),
//       ),
//     );

//     const endDateTimeOfDay = new Date(
//       addMinutes(
//         addHours(
//           `${format(currentDate, "yyyy-MM-dd")}`,
//           Number(endTime.split(":")[0]),
//         ),
//         parseInt(endTime.split(":")[1]),
//       ),
//     );

//     while (startDateTimeOfDay < endDateTimeOfDay) {
//       const slotStartDateTime = startDateTimeOfDay;
//       const slotEndDateTime = addMinutes(slotStartDateTime, interval);

//       const scheduleData = {
//         startDateTime: slotStartDateTime,
//         endDateTime: slotEndDateTime,
//       };

//       const existingSchedule = await prisma.schedule.findFirst({
//         where: scheduleData,
//       });

//       if (existingSchedule) {
//         throw new Error(
//           `Schedule already exists for ${format(slotStartDateTime, "yyyy-MM-dd HH:mm")} - ${format(slotEndDateTime, "yyyy-MM-dd HH:mm")}`,
//         );
//       } else {
//         const result = await prisma.schedule.create({
//           data: scheduleData,
//         });
//         schedules.push(result);
//       }
//       slotStartDateTime.setMinutes(slotStartDateTime.getMinutes() + interval);
//     }

//     currentDate.setDate(currentDate.getDate() + 1);
//   }

//   return schedules;
// };

// export const ScheduleServices = {
//   insertIntoDB,
// };
