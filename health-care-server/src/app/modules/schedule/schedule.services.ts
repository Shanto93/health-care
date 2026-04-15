import { Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
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

  // OPTIMIZATION: Date Range Query instead of Massive OR Array
  // We only query the DB for the absolute start and end times of the entire batch
  const firstDate = schedulesToInsert[0].startDateTime;
  const lastDateInBatch =
    schedulesToInsert[schedulesToInsert.length - 1].endDateTime;

  const existingSchedules = await prisma.schedule.findMany({
    where: {
      startDateTime: { gte: firstDate },
      endDateTime: { lte: lastDateInBatch },
    },
  });

  // O(1) JavaScript Set for lightning-fast conflict checking
  const existingSet = new Set(
    existingSchedules.map((s) => s.startDateTime.getTime()),
  );

  // 2. Check for ANY existing conflicts instantly in memory
  for (const schedule of schedulesToInsert) {
    if (existingSet.has(schedule.startDateTime.getTime())) {
      const conflictStart = schedule.startDateTime
        .toISOString()
        .replace("T", " ")
        .substring(0, 16);
      const conflictEnd = schedule.endDateTime
        .toISOString()
        .replace("T", " ")
        .substring(0, 16);
      throw new Error(
        `Schedule conflict detected. Slot already exists for ${conflictStart} - ${conflictEnd}`,
      );
    }
  }

  // 3. Bulk insert all slots safely
  await prisma.schedule.createMany({
    data: schedulesToInsert,
    skipDuplicates: true,
  });

  // 4. ELITE OPTIMIZATION: Fetch created records by range, then filter in memory
  const allSchedulesInRange = await prisma.schedule.findMany({
    where: {
      startDateTime: { gte: firstDate },
      endDateTime: { lte: lastDateInBatch },
    },
    orderBy: {
      startDateTime: "asc",
    },
  });

  // Filter out any global schedules that were already there to return ONLY what we just created
  const insertedSet = new Set(
    schedulesToInsert.map((s) => s.startDateTime.getTime()),
  );
  const createdSchedules = allSchedulesInRange.filter((s) =>
    insertedSet.has(s.startDateTime.getTime()),
  );

  return createdSchedules;
};

const schedulesForDoctor = async (
  user: JwtPayload,
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
        { startDateTime: { gte: startDateTime } },
        { endDateTime: { lte: endDateTime } },
      ],
    });
  }

  // OPTIMIZATION: Relational filtering.
  // We completely deleted the extra query and `notIn` array. PostgreSQL handles this natively now.
  const whereCondition: Prisma.ScheduleWhereInput = {
    AND: andConditions.length > 0 ? andConditions : undefined,
    doctorSchedules: {
      none: {
        doctor: {
          email: user.email,
        },
      },
    },
  };

  // OPTIMIZATION: Run data fetching and counting in parallel to cut request time in half!
  const [schedules, total] = await Promise.all([
    prisma.schedule.findMany({
      skip,
      take: limit,
      where: whereCondition,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.schedule.count({
      where: whereCondition,
    }),
  ]);

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
