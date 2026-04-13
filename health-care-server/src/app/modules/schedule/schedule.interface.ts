export interface ISchedulePayload {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface IScheduleFilters {
  startDateTime?: string;
  endDateTime?: string;
}
