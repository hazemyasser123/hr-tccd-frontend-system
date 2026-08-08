/**
 * Displays member details for attendance confirmation.
 * @module MemberDetailsCard
 */
import { IoPersonCircle } from "react-icons/io5";
import type { MemberData } from "@/shared/types/attendance";

/**
 * Props for MemberDetailsCard.
 * @property memberData - The member's attendance data.
 */
interface MemberDetailsCardProps {
  memberData: MemberData;
}

const MemberDetailsCard = ({ memberData }: MemberDetailsCardProps) => {
  return (
    <div className="bg-[var(--color-dashboard-border)] rounded-xl p-4 mb-6 text-left">
      <div className="flex items-center gap-2 mb-3">
        <IoPersonCircle className="text-secondary" size={25} />
        <h3 className="font-semibold text-[var(--color-contrast)]">
          Member Details
        </h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-[var(--color-dashboard-description)]">
            Name
          </span>
          <span className="text-sm font-medium text-[var(--color-contrast)]">
            {memberData.fullName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-[var(--color-dashboard-description)]">
            Team
          </span>
          <span className="text-sm font-medium text-[var(--color-contrast)]">
            {memberData.committee}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-[var(--color-dashboard-description)]">
            Status
          </span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              memberData.status === "late"
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            }`}
          >
            {memberData.status === "late" ? "Late" : "On Time"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-[var(--color-dashboard-description)]">
            Arrival Time
          </span>
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-[var(--color-dashboard-description)] mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-[var(--color-contrast)]">
              {memberData.arrivalTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailsCard;
