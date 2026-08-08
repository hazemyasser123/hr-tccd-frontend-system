import type { IconType } from "react-icons";
import { BiHomeAlt } from "react-icons/bi";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { FaWpforms } from "react-icons/fa";
import { FaUsersCog } from "react-icons/fa";
import { BiTask } from "react-icons/bi";

export const NAV_ITEMS: { to: string; icon: IconType; title: string }[] = [
  {
    to: "/",
    icon: BiHomeAlt,
    title: "Home",
  },
  {
      to: "/users",
      icon: FaUsersCog,
      title: "Users"
  },
  {
    to: "/events",
    icon: HiOutlineCalendarDays,
    title: "Events",
  },
  {
    to: '/judging-system/events',
    icon: BiTask,
    title: "Judging"
  },
  {
    to: "/form-builder",
    icon: FaWpforms,
    title: "Forms"
  },
];
