import { MdEvent } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { FaWpforms } from "react-icons/fa";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store/store";
import { BsCardChecklist, BsQrCode } from "react-icons/bs";
import { isAdminLike, isHRCommittee } from "@/shared/utils/access";

const ActionCards = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const admin = isAdminLike(user);
  // HR members: dashboard events + scan + own QR — nothing else.
  const hrOnly = isHRCommittee(user);

  const cardClasses =
    "flex-1 hover:bg-muted-primary/30 transition-colors duration-200 ease-in-out h-[80px] sm:h-[100px] md:h-[110px] bg-white dark:bg-surface-glass-bg shadow-lg border-gray-300 dark:border-surface-glass-border/10 flex flex-col items-center justify-center gap-1 p-2 cursor-pointer space-y-1";

  return (
    <div className="space-y-4 w-full">
      <p className="text-dashboard-heading font-bold text-[18px] md:text-[20px] lg:text-[24px] leading-[20px] font-inter px-3 sm:text-start text-center">
        Quick Actions
      </p>
      <div className="flex flex-row justify-between mx-auto border-y-4 border-primary shadow-lg">
        {admin && (
          <NavLink to={"/form-builder"} className={cardClasses}>
            <FaWpforms className="size-6 md:size-7 lg:size-9 text-primary" />
            <div className="text-dashboard-card-text font-bold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-[10px] md:leading-[14px] font-inter text-center">
              Manage Forms
            </div>
          </NavLink>
        )}
        {!hrOnly && (
          <NavLink to={"/events"} className={cardClasses}>
            <MdEvent className="size-6 md:size-7 lg:size-9 text-primary" />
            <div className="text-dashboard-card-text font-bold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-[10px] md:leading-[14px] font-inter text-center">
              Events
            </div>
          </NavLink>
        )}
        {admin && (
          <NavLink to={"/judging-system/events"} className={cardClasses}>
            <BsCardChecklist className="size-6 md:size-7 lg:size-9 text-primary" />
            <div className="text-dashboard-card-text font-bold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-[10px] md:leading-[14px] font-inter text-center">
              Judging System
            </div>
          </NavLink>
        )}
        <NavLink to={"/qr-code"} className={cardClasses}>
          <BsQrCode className="size-6 md:size-7 lg:size-9 text-primary" />
          <div className="text-dashboard-card-text font-bold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-[10px] md:leading-[14px] font-inter text-center">
            My QR Code
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default ActionCards;