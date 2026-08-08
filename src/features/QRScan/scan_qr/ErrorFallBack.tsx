import { ButtonTypes, ButtonWidths, Button } from "tccd-ui";

const ErrorFallBack = ({
  error,
  resetScanner,
}: {
  error: string;
  resetScanner: () => void;
}) => {
  return (
    <div className="aspect-square w-full flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <div className="w-16 h-16 md:w-20 md:h-20 mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 md:w-10 md:h-10 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.664 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <p className="text-red-600 font-medium mb-2">Camera Error</p>
      <p className="text-sm text-gray-600 mb-4">{error}</p>
      <Button
        buttonText="Try Again"
        onClick={resetScanner}
        type={ButtonTypes.PRIMARY}
        width={ButtonWidths.AUTO}
      />
    </div>
  );
};

export default ErrorFallBack;
