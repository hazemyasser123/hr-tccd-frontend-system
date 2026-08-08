import { Scanner } from "@yudiel/react-qr-scanner";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";

interface QRCodeScannerProps {
  onScan: (detectedCodes: IDetectedBarcode[]) => void | Promise<void>;
  onError: (error: unknown) => void;
}

const QRCodeScanner = ({ onScan, onError }: QRCodeScannerProps) => {
  return (
    <div className="aspect-square w-full max-w-full">
      <Scanner
        onScan={onScan}
        onError={onError}
        styles={{
          container: {
            width: "100%",
            height: "100%",
            borderRadius: "0",
          },
          video: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
          },
        }}
        constraints={{
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        }}
      />
    </div>
  );
};

export default QRCodeScanner;
