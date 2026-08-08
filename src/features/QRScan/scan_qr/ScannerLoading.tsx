/**
 * Loading spinner for scanner verification state.
 * @module ScannerLoading
 */
import { AiOutlineLoading3Quarters } from "react-icons/ai";

/**
 * Props for ScannerLoading.
 * @property message - Optional loading message.
 */
interface ScannerLoadingProps {
  message?: string;
}

const ScannerLoading = ({
  message = "Processing QR code...",
}: ScannerLoadingProps) => {
  return (
    <div className="aspect-square w-full flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <div className="w-16 h-16 md:w-20 md:h-20 mb-4 bg-blue-100 rounded-full flex items-center justify-center">
        <AiOutlineLoading3Quarters className="w-8 h-8 md:w-10 md:h-10 text-blue-500 animate-spin" />
      </div>
      <p className="text-blue-600 font-medium mb-2">Verifying Attendance</p>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

export default ScannerLoading;
