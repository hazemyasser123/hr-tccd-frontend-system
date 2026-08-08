/**
 * Displays the final confirmation after attendance is recorded.
 * @module FinalConfirmation
 */
/**
 * Props for FinalConfirmation.
 * @property lateReason - Reason for late arrival.
 * @property leaveExcuse - Reason for early leave.
 * @property attendanceStatus - Attendance status code.
 */
interface FinalConfirmationProps {
  lateReason: string;
  leaveExcuse: string;
  attendanceStatus: number | null;
}

const FinalConfirmation = ({
  lateReason,
  leaveExcuse,
  attendanceStatus,
}: FinalConfirmationProps) => {
  return (
    <div className="w-full bg-green-50 dark:bg-green-900/10 text-center p-6">
      <div className="w-16 h-16 md:w-20 md:h-20 mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
        <svg
          className="w-8 h-8 md:w-10 md:h-10 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-lg md:text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
        Attendance Confirmed!
      </h2>
      <p className="text-sm text-[var(--color-dashboard-description)] mb-4">
        The attendance has been successfully recorded.
      </p>
      {attendanceStatus === 2002 && lateReason && (
        <div className="bg-white dark:bg-surface-glass-bg rounded-lg p-3 border border-gray-200 dark:border-surface-glass-border/10">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Late Reason:
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {lateReason}
          </p>
        </div>
      )}
      {attendanceStatus === 2003 && leaveExcuse && (
        <div className="bg-white dark:bg-surface-glass-bg rounded-lg p-3 border border-gray-200 dark:border-surface-glass-border/10">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Leave Reason:
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {leaveExcuse}
          </p>
        </div>
      )}
    </div>
  );
};

export default FinalConfirmation;
