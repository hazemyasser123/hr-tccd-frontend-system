import type { User, AppRole } from "@/shared/types/user";
import {
  NAV_ITEMS,
  QR_NAV_ITEM,
  HOME_NAV_ITEM,
  JUDGING_NAV_ITEM,
  EVENTS_NAV_ITEM,
  type NavItem,
} from "@/constants";

type MaybeUser = User | null | undefined;

export const ADMIN_LIKE_ROLES: AppRole[] = [
  "Admin",
  "VolunteerDirector",
  "VolunteerVicePresident",
  "VolunteerPresident",
];

export const ATTENDEE_ROLES: AppRole[] = [
  "Student",
  "TA",
  "DR",
  "BusinessRep",
  "VolunteerMember",
  "VolunteerHead",
];

export const STAFF_ROLES: AppRole[] = [...ADMIN_LIKE_ROLES, "Vest", "Catering"];

export const isAdminLike = (user: MaybeUser): boolean =>
  !!user && ADMIN_LIKE_ROLES.some((role) => user.roles.includes(role));

export const isJudge = (user: MaybeUser): boolean =>
  !!user && user.roles.includes("Judge");

export const isVest = (user: MaybeUser): boolean =>
  !!user && user.roles.includes("Vest");

export const isCatering = (user: MaybeUser): boolean =>
  !!user && user.roles.includes("Catering");

/** Heads, members, students… — people whose app is basically their QR. */
export const isAttendee = (user: MaybeUser): boolean =>
  !!user && ATTENDEE_ROLES.some((role) => user.roles.includes(role));

/** HR committee member who is NOT admin-like → scanner tier. */
export const isHRCommittee = (user: MaybeUser): boolean =>
  !!user && user.committee === "HumanResources" && !isAdminLike(user);

/** Where to send a user right after login. */
export const getPostLoginRedirect = (user: MaybeUser): string => {
  if (!user) return "/login";
  if (isAdminLike(user)) return "/home";
  if (isJudge(user)) return "/judging-system/events";
  if (isHRCommittee(user) || isVest(user) || isCatering(user)) return "/home";
  return "/qr-code";
};

export const getNavItems = (user: MaybeUser): NavItem[] => {
  if (!user) return [];
  if (isAdminLike(user)) return NAV_ITEMS;
  if (isJudge(user)) return [JUDGING_NAV_ITEM, QR_NAV_ITEM];
  if (isCatering(user))
    return NAV_ITEMS.filter(
      (item) =>
        ![
          "/users",
          "/form-builder",
          "/judging-system/events",
          "/home",
        ].includes(item.to),
    );
  if (isVest(user)) return [HOME_NAV_ITEM, EVENTS_NAV_ITEM];
  if (isHRCommittee(user)) return [HOME_NAV_ITEM, QR_NAV_ITEM];
  return [QR_NAV_ITEM]; // attendees & unknown combos
};
