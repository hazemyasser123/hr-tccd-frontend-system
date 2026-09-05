import { MEMBER_POSITIONS, COMMITTEE_VALUES } from "@/shared/types/user";
import type { Position, Committee } from "@/shared/types/user";

export const USERS_SORTING_OPTIONS = [
  { label: "Name (A-Z)", value: "az" },
  { label: "Name (Z-A)", value: "za" },
  { label: "Committee (A-Z)", value: "caz" },
  { label: "Committee (Z-A)", value: "cza" },
];

const POSITION_LABELS: Record<Position, string> = {
  Member: "Member",
  Head: "Head",
  Director: "Director",
  VicePresident: "Vice President",
  President: "President",
};

export const POSITIONS: { label: string; value: Position }[] =
  MEMBER_POSITIONS.map((value) => ({
    label: POSITION_LABELS[value],
    value,
  }));

const COMMITTEE_LABELS: Record<Committee, string> = {
  Operations: "Operations",
  HumanResources: "HR",
  IT: "IT",
  GraphicDesign: "Graphic Design",
  ExternalRelations: "External Relations",
  ContentCreation: "Content Creation",
  Marketing: "Marketing",
  VideoEditing: "Video Editing",
  HighBoard: "High Board",
  Outsource: "Outsource",
};

export const TEAM_COMMITTEES: { label: string; value: Committee | "All" }[] = [
  { label: "All Committees", value: "All" },
  ...COMMITTEE_VALUES.map((value) => ({
    label: COMMITTEE_LABELS[value],
    value,
  })),
];
