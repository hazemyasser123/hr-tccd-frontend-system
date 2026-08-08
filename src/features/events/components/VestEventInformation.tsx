import type { Event, VestAttendee } from "@/shared/types/event";
import { format } from "@/shared/utils";
import { ButtonTypes, ButtonWidths, Button } from "tccd-ui";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store/store";

interface VestEventInformationProps {
  event: Event;
  attendees: VestAttendee[];
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
}

const VestEventInformation = ({
  event,
  attendees,
  onEdit,
  onDelete,
}: VestEventInformationProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.roles || [];
  const isAdmin = userRole.includes("Admin");
  return (
    <div className="bg-white dark:bg-surface-glass-bg rounded-lg shadow-sm border border-dashboard-card-border p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dashboard-heading">
          {event.title || "Untitled Event"}
        </h2>
        <div className="flex gap-2">
          {onEdit && isAdmin && (
            <Button
              buttonText="Edit"
              onClick={() => onEdit(event.id)}
              type={ButtonTypes.TERTIARY}
              width={ButtonWidths.AUTO}
            />
          )}
          {onDelete && isAdmin && (
            <Button
              buttonText="Delete"
              onClick={() => onDelete(event.id)}
              type={ButtonTypes.DANGER}
              width={ButtonWidths.AUTO}
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 text-dashboard-description">
        <div className="flex flex-col space-y-1 sm:space-y-2">
          <span className="font-semibold text-dashboard-heading text-xs sm:text-sm lg:text-base">
            Start Date & Time
          </span>
          <div className="text-dashboard-card-text text-sm sm:text-base lg:text-lg">
            {event.startDate ? format(event.startDate, "full") : "N/A"}
          </div>
        </div>
        <div className="flex flex-col space-y-1 sm:space-y-2">
          <span className="font-semibold text-dashboard-heading text-xs sm:text-sm lg:text-base">
            End Date & Time
          </span>
          <div className="text-dashboard-card-text text-sm sm:text-base lg:text-lg">
            {event.endDate ? format(event.endDate, "full") : "N/A"}
          </div>
        </div>
      </div>

      {/* Vest Summary Statistics */}
      {attendees && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-dashboard-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 sm:p-3 lg:p-4">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-dashboard-heading">
                {attendees.length}
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-dashboard-description">
                Total
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2 sm:p-3 lg:p-4">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-contrast">
                {attendees.filter((a) => a.status === "Received").length}
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-dashboard-description">
                Received
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 sm:p-3 lg:p-4">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-secondary">
                {attendees.filter((a) => a.status === "Returned").length}
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-dashboard-description">
                Returned
              </div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2 sm:p-3 lg:p-4">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-primary">
                {attendees.filter((a) => a.status === "NotReceived").length}
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-dashboard-description">
                Not Received
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VestEventInformation;
