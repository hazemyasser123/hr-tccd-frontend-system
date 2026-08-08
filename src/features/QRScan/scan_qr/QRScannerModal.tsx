import { ScannerContainer, MemberDetailsCard, FinalConfirmation } from "@/features/QRScan/scan_qr";
import AdjustMemberCateringModal from "@/features/QRScan/scan_qr/AdjustMemberCateringModal";
import AdjustCompanyCateringModal from "@/features/QRScan/scan_qr/AdjustCompanyCateringModal";
import { useAttendanceFlow } from "@/shared/hooks/useAttendanceFlow";
import { useUpdateVestStatus, useVestStatus } from "@/shared/queries/events";
import type { Event } from "@/shared/types/event";
import { useState, useEffect } from "react";
import { Button, Modal } from "tccd-ui";
import ReasonPopup from "@/features/QRScan/QR/ReasonPopup";
import toast from "react-hot-toast";
import { FaCheckCircle, FaClock, FaSignOutAlt, FaShoppingCart, FaTag } from "react-icons/fa";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Omit<Event, "attendees">;
}

type ActionType = "attendance" | "earlyLeave" | null;

const STATUS = {
  ON_TIME: 2001,
  LATE: 2002,
  LEAVING_EARLY: 2003,
} as const;

const tileBase = "w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-glass-bg shadow-sm hover:border-secondary dark:hover:border-secondary hover:shadow-md transition-all text-left cursor-pointer";
const sectionFooterClass = "p-4 bg-dashboard-border dark:bg-background-contrast border-t border-dashboard-card-border dark:border-dashboard-border";

const QRScannerModal = ({ isOpen, onClose, event }: QRScannerModalProps) => {
  const {
    isScanning,
    error,
    memberData,
    companyData,
    attendanceStatus,
    lateReason,
    setLateReason,
    leaveExcuse,
    setLeaveExcuse,
    attendanceConfirmed,
    handleScan,
    confirmAttendance,
    reset,
  } = useAttendanceFlow(event.id);

  const vestStatusUpdate = useUpdateVestStatus();
  const { data: vestStatus } = useVestStatus(memberData?.id ?? "", event.id);

  const [currentVestStatus, setCurrentVestStatus] = useState("NotReceived");
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [isMemberCateringOpen, setIsMemberCateringOpen] = useState(false);
  const [isCompanyCateringOpen, setIsCompanyCateringOpen] = useState(false);

  useEffect(() => {
    if (vestStatus) setCurrentVestStatus(vestStatus);
  }, [vestStatus]);

  useEffect(() => {
    if (!memberData && !companyData) setSelectedAction(null);
  }, [memberData, companyData]);

  const handleReset = () => {
    setSelectedAction(null);
    reset();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleVestToggle = () => {
    if (!memberData?.id) return;
    const action = currentVestStatus === "Received" ? "Returned" : "Received";
    vestStatusUpdate.mutate(
      { memberId: memberData.id, eventId: event.id, action },
      {
        onSuccess: () => {
          toast.success(action === "Received" ? "Vest Assigned!" : "Vest Returned!");
          setCurrentVestStatus(action);
        },
        onError: () => toast.error("Failed to update vest status."),
      }
    );
  };

  const renderActionMenu = () => {
    const isLeavingEarly = attendanceStatus === STATUS.LEAVING_EARLY;
    return (
      <div className="space-y-2">
        {!isLeavingEarly ? (
          <button className={tileBase} onClick={() => attendanceStatus === STATUS.LATE ? setSelectedAction("attendance") : confirmAttendance()}>
            <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
              {attendanceStatus === STATUS.LATE
                ? <FaClock className="text-secondary" size={16} />
                : <FaCheckCircle className="text-secondary" size={16} />}
            </div>
            <div>
              <p className="font-semibold text-(--color-contrast) text-sm">Scan Attendance</p>
              <p className="text-xs text-dashboard-description">
                {attendanceStatus === STATUS.LATE ? "Late arrival — reason required" : "Record check-in"}
              </p>
            </div>
          </button>
        ) : (
          <button className={tileBase} onClick={() => setSelectedAction("earlyLeave")}>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FaSignOutAlt className="text-primary" size={16} />
            </div>
            <div>
              <p className="font-semibold text-(--color-contrast) text-sm">Early Leave</p>
              <p className="text-xs text-dashboard-description">Record early departure — reason required</p>
            </div>
          </button>
        )}

        <button className={tileBase} onClick={() => setIsMemberCateringOpen(true)}>
          <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
            <FaShoppingCart className="text-secondary" size={16} />
          </div>
          <div>
            <p className="font-semibold text-(--color-contrast) text-sm">Adjust Catering</p>
            <p className="text-xs text-dashboard-description">Record catering consumption</p>
          </div>
        </button>

        <button
          className={`${tileBase} disabled:opacity-50`}
          onClick={handleVestToggle}
          disabled={vestStatusUpdate.isPending}
        >
          <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
            <FaTag className="text-secondary" size={16} />
          </div>
          <div>
            <p className="font-semibold text-(--color-contrast) text-sm">
              {vestStatusUpdate.isPending ? "Updating..." : currentVestStatus === "Received" ? "Return Vest" : "Assign Vest"}
            </p>
            <p className="text-xs text-dashboard-description">Current status: {currentVestStatus}</p>
          </div>
        </button>

        <Button buttonText="Scan Another QR Code" onClick={handleReset} type="ghost" width="full" />
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={`Scan QR Code — ${event.title}`}
      >
        <div className="p-4 space-y-3">
          {/* ── Scanning / error / loading phase ─────────────────────── */}
          {!memberData && !companyData && (
            <div className="rounded-xl overflow-hidden border border-dashboard-card-border dark:border-dashboard-border">
              <ScannerContainer
                isScanning={isScanning}
                error={error}
                memberData={null}
                companyData={null}
                attendanceConfirmed={false}
                lateReason=""
                attendanceStatus={null}
                leaveExcuse=""
                onScan={handleScan}
                onError={(err) => console.error(err)}
                onReasonChange={() => {}}
                onResetScanner={handleReset}
              />
              {!isScanning && !error && (
                <div className="flex items-center justify-center gap-2 p-4 text-dashboard-description">
                  <svg className="w-4 h-4 animate-spin text-secondary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span className="text-sm">Fetching member data...</span>
                </div>
              )}
            </div>
          )}

          {/* ── Member scanned ──────────────────────────────────────── */}
          {memberData && !attendanceConfirmed && (
            <>
              <MemberDetailsCard memberData={memberData} />
              <div className={sectionFooterClass.replace("p-4 ", "p-0 ") + " rounded-xl"}>
                <div className="p-3">
                  {renderActionMenu()}
                </div>
              </div>
            </>
          )}

          {memberData && attendanceConfirmed && (
            <>
              <FinalConfirmation
                lateReason={lateReason}
                leaveExcuse={leaveExcuse}
                attendanceStatus={attendanceStatus}
              />
              <Button buttonText="Scan Another QR Code" onClick={handleReset} type="secondary" width="full" />
            </>
          )}

          {/* ── Company scanned ─────────────────────────────────────── */}
          {companyData && !memberData && (
            <>
              <div className="w-full bg-green-50 dark:bg-green-900/10 text-center p-5 rounded-xl border border-dashboard-card-border dark:border-dashboard-border">
                <div className="w-14 h-14 mb-3 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-text-title mb-1">QR Verified!</h2>
                <p className="text-sm text-dashboard-description">{companyData.companyName}</p>
              </div>
              <Button buttonText="Adjust Catering" onClick={() => setIsCompanyCateringOpen(true)} type="secondary" width="full" />
              <Button buttonText="Scan Another QR Code" onClick={handleReset} type="ghost" width="full" />
            </>
          )}
        </div>
      </Modal>

      <ReasonPopup
        isOpen={selectedAction === "attendance"}
        onClose={() => setSelectedAction(null)}
        onSubmit={async (reason) => {
          setLateReason(reason);
          await confirmAttendance(reason);
          setSelectedAction(null);
        }}
        title="Late Arrival Notice"
        prompt="Please provide the reason for late arrival"
        initialReason={lateReason}
      />

      <ReasonPopup
        isOpen={selectedAction === "earlyLeave"}
        onClose={() => setSelectedAction(null)}
        onSubmit={async (reason) => {
          setLeaveExcuse(reason);
          await confirmAttendance(undefined, reason);
          setSelectedAction(null);
        }}
        title="Early Leave Notice"
        prompt="Please provide the reason for early leave"
        initialReason={leaveExcuse}
      />

      {memberData && (
        <AdjustMemberCateringModal
          isOpen={isMemberCateringOpen}
          onClose={() => setIsMemberCateringOpen(false)}
          memberId={memberData.id}
          memberName={memberData.fullName}
          eventId={event.id}
        />
      )}
      {companyData && (
        <AdjustCompanyCateringModal
          isOpen={isCompanyCateringOpen}
          onClose={() => setIsCompanyCateringOpen(false)}
          companyData={companyData}
          eventId={event.id}
        />
      )}
    </>
  );
};

export default QRScannerModal;
