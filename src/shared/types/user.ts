export const USER_ROLES = [
  "Student",
  "TA",
  "DR",
  "Judge",
  "Admin",
  "BusinessRep",
  "VolunteerMember",
  "VolunteerHead",
  "VolunteerDirector",
  "VolunteerVicePresident",
  "VolunteerPresident",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const FUNCTIONAL_ROLES = ["Vest", "Catering"] as const;
export type FunctionalRole = (typeof FUNCTIONAL_ROLES)[number];

export type AppRole = UserRole | FunctionalRole;

export const MEMBER_POSITIONS = [
  "Member",
  "Head",
  "Director",
  "VicePresident",
  "President",
] as const;
export type Position = (typeof MEMBER_POSITIONS)[number];

export const COMMITTEE_VALUES = [
  "Operations",
  "HumanResources",
  "IT",
  "GraphicDesign",
  "ExternalRelations",
  "ContentCreation",
  "Marketing",
  "VideoEditing",
  "HighBoard",
  "Outsource",
] as const;
export type Committee = (typeof COMMITTEE_VALUES)[number];

export interface User {
  id: string;
  email: string;
  name: string;
  profileImageUrl: string;
  phoneNumber?: string;
  nationalId?: string;
  graduationYear?: number | null;
  educationSystem?: string;
  major?: string;
  committee?: Committee;
  roles: AppRole[];
  password?: string;
}
