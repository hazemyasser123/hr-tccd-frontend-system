export const status = {
  SUBMITTED: 0,
  CANCELLED: 1,
} as const;

export interface QRScanType {
  userId: string;
}
