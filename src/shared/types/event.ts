import type { member } from "./member";

export interface Attendee extends member {
  status: "Attended" | "Absent" | "Left";
  attendanceRecords: {
    checkInTime: string;
    checkOutTime: string | null;
    lateArrivalExcuse: string | null;
    earlyLeaveExcuse: string | null;
  }[];
}

export interface VestAttendee extends member {
  status: "NotReceived" | "Received" | "Returned";
}

export interface EventType {
  id: string;
  label: string;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  eventType: string;
  startDate: string;
  endDate: string;
  attendees?: Attendee[] | VestAttendee[];
}
