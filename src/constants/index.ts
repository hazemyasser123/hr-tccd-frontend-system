import type { IconType } from "react-icons";
import { BiHomeAlt } from "react-icons/bi";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { FaWpforms } from "react-icons/fa";
import { FaUsersCog } from "react-icons/fa";
import { BiTask } from "react-icons/bi";
import { BsQrCode } from "react-icons/bs";

export interface NavItem {
  to: string;
  icon: IconType;
  title: string;
}

export const HOME_NAV_ITEM: NavItem = {
  to: "/home",
  icon: BiHomeAlt,
  title: "Home",
};
export const USERS_NAV_ITEM: NavItem = {
  to: "/users",
  icon: FaUsersCog,
  title: "Users",
};
export const EVENTS_NAV_ITEM: NavItem = {
  to: "/events",
  icon: HiOutlineCalendarDays,
  title: "Events",
};
export const JUDGING_NAV_ITEM: NavItem = {
  to: "/judging-system/events",
  icon: BiTask,
  title: "Judging",
};
export const FORMS_NAV_ITEM: NavItem = {
  to: "/form-builder",
  icon: FaWpforms,
  title: "Forms",
};
export const QR_NAV_ITEM: NavItem = {
  to: "/qr-code",
  icon: BsQrCode,
  title: "QR Code",
};

export const NAV_ITEMS: NavItem[] = [
  HOME_NAV_ITEM,
  USERS_NAV_ITEM,
  EVENTS_NAV_ITEM,
  JUDGING_NAV_ITEM,
  FORMS_NAV_ITEM,
];

/** @deprecated — kept as alias; use QR_NAV_ITEM. */
export const VOLUNTEER_NAV_ITEM = QR_NAV_ITEM;
