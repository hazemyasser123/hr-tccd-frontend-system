export interface MemberData {
  id: string;
  fullName: string;
  email: string;
  nationalId: string;
  phoneNumber: string;
  graduationYear: number;
  engineeringMajor: string;
  educationSystem: string;
  position: string;
  committee: string;
  isActive: boolean;
  // Additional fields for QR scanner functionality
  name: string; // Alias for fullName for backward compatibility
  team: string; // Alias for committee for backward compatibility
  status: "on-time" | "late" | "leaving-early" | "pending";
  arrivalTime: string;
  eventStartTime?: string;
}

export type AttendanceStatus = "scanning" | "member-found" | "confirming" | "confirmed";