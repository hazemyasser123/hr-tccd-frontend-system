import axios from "axios";

/**
 * Extracts a meaningful error message from an Axios error or a generic error.
 * @param error - The error object to process.
 * @returns A user-friendly error message.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message || // API-provided message
      error.response?.statusText || // HTTP status text
      error.message ||
      "An error occurred while fetching data" // Default fallback
    );
  }

  // Handle non-Axios errors (e.g., network issues, JS errors)
  return error instanceof Error ? error.message : "Unexpected error occurred";
}
