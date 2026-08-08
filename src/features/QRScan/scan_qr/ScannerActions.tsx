/**
 * Renders action buttons and reason inputs for the scanner flow.
 * @module ScannerActions
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "tccd-ui";
import { useUpdateVestStatus, useVestStatus } from "@/shared/queries/events";
import type { MemberData } from "@/shared/types/attendance";
//import { useEventCateringItems } from "@/shared/queries/catering";
import AdjustMemberCateringModal from "./AdjustMemberCateringModal";
import AdjustCompanyCateringModal from "./AdjustCompanyCateringModal";
import type { CompanyQRScanResponse } from "@/shared/types/company";
//import { useEventCompanyCatering } from "@/shared/queries/companies";

/**
 * Props for ScannerActions.
 * @property attendanceConfirmed - Whether attendance is confirmed.
 * @property memberData - The member's data, if scanned.
 * @property isConfirming - Loading state for confirmation.
 * @property lateReason - Reason for late arrival.
 * @property leaveExcuse - Reason for early leave.
 * @property attendanceStatus - Attendance status code.
 * @property onConfirmAttendance - Handler for confirming attendance.
 * @property onReturnToEvents - Handler for returning to events list.
 * @property onResetScanner - Handler for resetting the scanner.
 * @property onReasonChange - Handler for reason textarea change (late/early).
 * @property eventType - Type of the event (e.g., "Meeting", "Workshop").
 * @property eventId - ID of the event.
 */
interface ScannerActionsProps {
  attendanceConfirmed: boolean;
  memberData: MemberData | null;
  companyData: CompanyQRScanResponse | null;
  isConfirming: boolean;
  lateReason: string;
  leaveExcuse?: string;
  attendanceStatus?: number | null;
  onConfirmAttendance: () => void;
  onReturnToEvents: () => void;
  onResetScanner: () => void;
  onReasonChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  eventType?: string;
  eventId: string;
}

// Attendance status constants
const STATUS = {
  ON_TIME: 2001,
  LATE: 2002,
  LEAVING_EARLY: 2003,
} as const;

const ScannerActions = ({
  attendanceConfirmed,
  memberData,
  companyData,
  isConfirming,
  lateReason,
  onConfirmAttendance,
  onReturnToEvents,
  onResetScanner,
  attendanceStatus = null,
  leaveExcuse = "",
  eventId,
}: ScannerActionsProps) => {
  const vestStatusUpdate = useUpdateVestStatus();
  const { data: vestStatus } = useVestStatus(memberData?.id || "", eventId);
  // const { data: cateringItems } = useEventCateringItems(eventId, memberData?.id, memberData ? true : false);
  // const { data: companyCateringItems } = useEventCompanyCatering(eventId, companyData?.companyId, companyData ? true : false);

  const [currentVestStatus, setCurrentVestStatus] = useState<string>(vestStatus || "NotReceived");
  const [isMemberCateringModalOpen, setIsMemberCateringModalOpen] = useState(false);
  const [isCompanyCateringModalOpen, setIsCompanyCateringModalOpen] = useState(false);

  useEffect(() => {
    if (vestStatus) {
      setCurrentVestStatus(vestStatus || "NotReceived");
    }
  }, [vestStatus]);

  const handleVestStatus = async () => {
    if (!memberData?.id) return;

    const action =
      currentVestStatus === "Received"
        ? "Returned"
        : "Received";

    vestStatusUpdate.mutate(
      {
        memberId: memberData.id,
        eventId,
        action,
      },
      {
        onSuccess: () => {
          toast.success(
            currentVestStatus === "Received"
            ? "Vest Returned Successfully!"
            : "Vest Assigned Successfully!"
          );
          setCurrentVestStatus(action);
        },
        onError: () => {
          toast.error("An error occurred. Please try again.");
        },
      }
    );
  };

  const getVestButtonText = () => {
    return currentVestStatus === "Received"
      ? "Return Vest"
      : "Assign Vest";
  };

  const getConfirmButtonText = () => {
    if (isConfirming) return "Confirming...";

    if (attendanceStatus === STATUS.LATE) return "Confirm Late Arrival";
    if (attendanceStatus === STATUS.LEAVING_EARLY) return "Confirm Leave Early";

    return "Confirm Attendance";
  };

  const isConfirmDisabled = () => {
    const isLate = attendanceStatus === STATUS.LATE;
    const isLeavingEarly = attendanceStatus === STATUS.LEAVING_EARLY;
    const reasonValue = isLate ? lateReason : leaveExcuse || "";

    return (isLate || isLeavingEarly) && !reasonValue.trim();
  };

  // Render confirmed state
  if (attendanceConfirmed) {
    return (
      <div className="space-y-3">
        <Button
          buttonText="Return to Events"
          onClick={onReturnToEvents}
          type="secondary"
          width="full"
        />
        <Button
          buttonText="Scan Another QR Code"
          onClick={onResetScanner}
          type="ghost"
          width="full"
        />
      </div>
    );
  }

  // Render member scanned state
  if (memberData) {
    return (
      <div className="space-y-3">
        <Button
          buttonText={getConfirmButtonText()}
          onClick={onConfirmAttendance}
          type="secondary"
          width="full"
          disabled={isConfirmDisabled()}
          loading={isConfirming}
        />
        <Button
          buttonText={getVestButtonText()}
          onClick={handleVestStatus}
          type="primary"
          width="full"
          loading={vestStatusUpdate.isPending}
        />
        <Button
          buttonText="Adjust catering items"
          onClick={() => setIsMemberCateringModalOpen(true)}
          type="tertiary"
          width="full"
        />
        <Button
          buttonText="Scan Another QR Code"
          onClick={onResetScanner}
          type="ghost"
          width="full"
        />
        <AdjustMemberCateringModal
          isOpen={isMemberCateringModalOpen}
          onClose={() => setIsMemberCateringModalOpen(false)}
          memberId={memberData.id}
          memberName={memberData.fullName}
          eventId={eventId}
        />
      </div>
    );
  }

  if (companyData) {
    return (
      <div className="space-y-2">
        <Button
          buttonText="Adjust catering items"
          onClick={() => setIsCompanyCateringModalOpen(true)}
          type="tertiary"
          width="full"
        />
        <Button
          buttonText="Scan Another QR Code"
          onClick={onResetScanner}
          type="ghost"
          width="full"
        />
        <AdjustCompanyCateringModal
          isOpen={isCompanyCateringModalOpen}
          onClose={() => setIsCompanyCateringModalOpen(false)}
          companyData={companyData}
          eventId={eventId}

        />
      </div>
    )
  }

  // Render idle/waiting state
  return (
    <div className="text-center">
      <div className="flex items-center justify-center space-x-2 text-[var(--color-dashboard-description)]">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm">Camera Active - Ready to Scan</span>
      </div>
    </div>
  );
};

export default ScannerActions;
