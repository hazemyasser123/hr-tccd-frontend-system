/**
 * Displays the confirmation UI for attendance, including status and reason forms.
 * @module AttendanceConfirmation
 */
import { FaCheckCircle, FaClock, FaSignOutAlt } from "react-icons/fa";
import type { MemberData } from "@/shared/types/attendance";
import MemberDetailsCard from "./MemberDetailsCard";

/**
 * Props for AttendanceConfirmation.
 * @property memberData - The member's data.
 * @property attendanceStatus - Attendance status code.
 * @property lateReason - Reason for late arrival.
 * @property leaveExcuse - Reason for early leave.
 * @property onReasonChange - Handler for reason textarea change (late/early).
 */
interface AttendanceConfirmationProps {
  memberData: MemberData;
  attendanceStatus: number | null;
  lateReason: string;
  leaveExcuse: string;
  onReasonChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const AttendanceConfirmation = ({
  memberData,
  attendanceStatus,
  lateReason,
  leaveExcuse,
  onReasonChange,
}: AttendanceConfirmationProps) => {
  // Helper function to get status configuration
  const getStatusConfig = (status: number | null) => {
    switch (status) {
      case 2001:
        return {
          icon: <FaCheckCircle className="text-green-500" size={40} />,
          title: "On-Time Attendance",
          message:
            "The attendance status for the recently scanned member has been successfully updated.",
          bgColor: "bg-green-50 dark:bg-green-900/10",
          borderColor: "border-green-200 dark:border-green-900/30",
          textColor: "text-green-600 dark:text-green-400",
          iconBg: "bg-green-100 dark:bg-green-900/30",
        };
      case 2002:
        return {
          icon: <FaClock className="text-orange-500" size={40} />,
          title: "Late Arrival Detected",
          message:
            "Please provide a reason for late arrival before confirming.",
          bgColor: "bg-orange-50 dark:bg-orange-900/10",
          borderColor: "border-orange-200 dark:border-orange-900/30",
          textColor: "text-orange-600 dark:text-orange-400",
          iconBg: "bg-orange-100 dark:bg-orange-900/30",
        };
      case 2003:
        return {
          icon: <FaSignOutAlt className="text-blue-500" size={40} />,
          title: "Early Leave Detected",
          message:
            "Please provide a reason for leaving early before confirming.",
          bgColor: "bg-blue-50 dark:bg-blue-900/10",
          borderColor: "border-blue-200 dark:border-blue-900/30",
          textColor: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
        };
      default:
        return {
          icon: <FaCheckCircle className="text-gray-500" size={40} />,
          title: "Attendance Status",
          message: "Processing attendance status...",
          bgColor: "bg-gray-50 dark:bg-gray-900/10",
          borderColor: "border-gray-200 dark:border-gray-800",
          textColor: "text-gray-600 dark:text-gray-400",
          iconBg: "bg-gray-100 dark:bg-gray-800",
        };
    }
  };

  const statusConfig = getStatusConfig(attendanceStatus);

  return (
    <div
      className={`w-full text-center p-6 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
    >
      {/* Status Icon */}
      <div
        className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusConfig.iconBg} mb-4`}
      >
        {statusConfig.icon}
      </div>

      {/* Status Title */}
      <h2
        className={`text-lg md:text-xl font-semibold ${statusConfig.textColor} mb-2`}
      >
        {statusConfig.title}
      </h2>

      {/* Status Message */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {statusConfig.message}
      </p>

      {/* Member Details Card */}
      <div className="mb-6">
        <MemberDetailsCard memberData={memberData} />
      </div>

      {/* Reason Form for Status 2002 (late) or 2003 (early leave) */}
      {(attendanceStatus === 2002 || attendanceStatus === 2003) && (
        <div className="mb-6">
          <label
            htmlFor="reason-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {attendanceStatus === 2002
              ? "Reason for Late Arrival *"
              : "Reason for Leaving Early *"}
          </label>
          <textarea
            id="reason-input"
            value={attendanceStatus === 2002 ? lateReason : leaveExcuse}
            onChange={onReasonChange}
            disabled
            placeholder={
              attendanceStatus === 2002
                ? "Please provide a reason for late arrival..."
                : "Please provide a reason for leaving early..."
            }
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-surface-glass-bg text-text-body-main ${
              !(attendanceStatus === 2002 ? lateReason : leaveExcuse).trim()
                ? "border-red-300 dark:border-red-800 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-surface-glass-border/20 focus:ring-blue-500 focus:border-blue-500"
            }`}
            rows={4}
            maxLength={500}
          />
          {!(attendanceStatus === 2002 ? lateReason : leaveExcuse).trim() && (
            <p className="mt-1 text-sm text-red-600">
              Reason is required for{" "}
              {attendanceStatus === 2002 ? "late attendance" : "early leave"}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {attendanceStatus === 2002 ? lateReason.length : leaveExcuse.length}
            /500 characters
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceConfirmation;
