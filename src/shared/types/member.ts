import type { Committee, Position } from "./user";

/**
 * The MEMBER entity (GET /v1/Members → MemberResponse).
 * Members carry `position` (org title) — the auth User does NOT.
 * MemberResponse has NO `role` field: authorization lives on User.roles.
 */
export interface member {
  id: string;
  name: string; // mapped from MemberResponse.fullName
  email: string;
  phoneNumber: string;
  nationalId: string;
  engineeringMajor: string; // mapped from MemberResponse.major
  educationSystem: string;
  gradYear: number; // mapped from MemberResponse.graduationYear
  committee: Committee;
  /** Org-hierarchy title — Member entity ONLY. Never an auth role. */
  position?: Position;
  hasAccount?: boolean;
  accountPassword?: string;
}
