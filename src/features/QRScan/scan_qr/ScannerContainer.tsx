/**
 * Container for the QR scanner and all attendance states.
 * @module ScannerContainer
 */
import QRCodeScanner from "./QRCodeScanner";
import ErrorFallBack from "./ErrorFallBack";
import AttendanceConfirmation from "./AttendanceConfirmation";
import FinalConfirmation from "./FinalConfirmation";
import ScannerLoading from "./ScannerLoading";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import type { MemberData } from "@/shared/types/attendance";
import type { CompanyQRScanResponse } from "@/shared/types/company";

/**
 * Props for ScannerContainer.
 * @property isScanning - Whether the scanner is active.
 * @property error - Error message, if any.
 * @property memberData - The member's data, if scanned.
 * @property attendanceConfirmed - Whether attendance is confirmed.
 * @property lateReason - Reason for late arrival.
 * @property leaveExcuse - Reason for early leave.
 * @property attendanceStatus - Attendance status code.
 * @property isVerifying - Whether verification is in progress.
 * @property onScan - Handler for QR scan event.
 * @property onError - Handler for scanner error.
 * @property onReasonChange - Handler for reason textarea change.
 * @property onResetScanner - Handler for resetting the scanner.
 */
interface ScannerContainerProps {
  isScanning: boolean;
  error: string | null;
  memberData: MemberData | null;
  companyData: CompanyQRScanResponse | null;
  attendanceConfirmed: boolean;
  lateReason: string;
  attendanceStatus: number | null;
  leaveExcuse: string;
  isVerifying?: boolean;
  onScan: (detectedCodes: IDetectedBarcode[]) => void | Promise<void>;
  onError: (error: unknown) => void;
  onReasonChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onResetScanner: () => void;
}

const ScannerContainer = ({
  isScanning,
  error,
  memberData,
  companyData,
  attendanceConfirmed,
  lateReason,
  attendanceStatus,
  leaveExcuse,
  isVerifying = false,
  onScan,
  onError,
  onReasonChange,
  onResetScanner,
}: ScannerContainerProps) => {
  return (
    <div className="relative">
      {/* Scanner State */}
      {isScanning && !error && !memberData && !companyData && !isVerifying && (
        <QRCodeScanner onScan={onScan} onError={onError} />
      )}

      {/* Verifying State */}
      {isVerifying && <ScannerLoading />}

      {/* Error State */}
      {error && !memberData && !companyData && (
        <ErrorFallBack error={error} resetScanner={onResetScanner} />
      )}

      {/* Success State - Attendance Confirmation */}
      {memberData && !companyData && !attendanceConfirmed && !isVerifying && (
        <AttendanceConfirmation
          memberData={memberData}
          attendanceStatus={attendanceStatus}
          lateReason={lateReason}
          leaveExcuse={leaveExcuse}
          onReasonChange={onReasonChange}
        />
      )}

      {/* Final Confirmation State */}
      {attendanceConfirmed && memberData && (
        <FinalConfirmation
          lateReason={lateReason}
          leaveExcuse={leaveExcuse}
          attendanceStatus={attendanceStatus}
        />
      )}

      {companyData && !memberData && (
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
            QR Verified!
          </h2>
          <p className="text-sm text-[var(--color-dashboard-description)] mb-4">
            Hello, {companyData.companyName}!
          </p>
        </div>
      )}
    </div>
  );
};

export default ScannerContainer;
