import { MdEvent } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { FaWpforms } from "react-icons/fa";
import { useSelector } from "react-redux";
import { BsCardChecklist } from "react-icons/bs";

const ActionCards = () => {
  const userRoles = useSelector((state: any) => state.auth.user?.roles || []);

  return (
    <div className="space-y-4 w-full">
      <p className="text-dashboard-heading font-bold text-[18px] md:text-[20px] lg:text-[24px] leading-[20px] font-inter px-3 sm:text-start text-center">
        Quick Actions
      </p>
      <div className="flex flex-row justify-between mx-auto border-y-4 border-primary shadow-lg">
        <NavLink
          to={"/form-builder"}
          className="flex-1 hover:bg-muted-primary/30 transition-colors duration-200 ease-in-out h-[80px] sm:h-[100px] md:h-[110px] bg-white dark:bg-surface-glass-bg shadow-lg border-gray-300 dark:border-surface-glass-border/10 flex flex-col items-center justify-center gap-1 p-2 cursor-pointer space-y-1"
        >
          <FaWpforms className="size-6 md:size-7 lg:size-9 text-primary" />
          <div className="text-dashboard-card-text font-bold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-[10px] md:leading-[14px] font-inter text-center">
            Manage Forms
          </div>
        </NavLink>
        <NavLink
          to={"/events"}
          className="flex-1 hover:bg-muted-primary/30 transition-colors duration-200 ease-in-out h-[80px] sm:h-[100px] md:h-[110px] bg-white dark:bg-surface-glass-bg shadow-lg flex flex-col items-center justify-center gap-1 p-2 cursor-pointer space-y-1"
        >
          <MdEvent className="size-6 md:size-7 lg:size-9 text-primary" />
          <div className="text-dashboard-card-text font-bold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-[10px] md:leading-[14px] font-inter text-center">
            Past Events
          </div>
        </NavLink>
        {userRoles.includes("Admin") && (
          <NavLink
            to={"/judging-system/events"}
            className="flex-1 hover:bg-muted-primary/30 transition-colors duration-200 ease-in-out h-[80px] sm:h-[100px] md:h-[110px] bg-white dark:bg-surface-glass-bg shadow-lg flex flex-col items-center justify-center gap-1 p-2 cursor-pointer space-y-1"
          >
            <BsCardChecklist className="size-6 md:size-7 lg:size-9 text-primary" />
            <div className="text-dashboard-card-text font-bold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-[10px] md:leading-[14px] font-inter text-center">
              Judging System
            </div>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default ActionCards;
