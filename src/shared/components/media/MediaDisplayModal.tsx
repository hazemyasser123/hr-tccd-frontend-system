import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";
import { Button } from "tccd-ui";

interface MediaDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title?: string;
  subtitle?: string;
  allowDownload?: boolean;
}

export default function MediaDisplayModal({
  isOpen,
  onClose,
  imageSrc,
  title = "QR Code",
  subtitle = "Scan or present this QR code at attendance checkpoints.",
  allowDownload = true,
}: MediaDisplayModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageSrc) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `TCCD-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Direct download failed, attempting fallback:", err);
      const link = document.createElement("a");
      link.href = imageSrc;
      link.download = `TCCD-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-[100000] w-full max-w-lg bg-surface-glass-bg border border-surface-glass-border/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center gap-4 text-center transform transition-all duration-300 scale-100">
        {/* Header with Close Button */}
        <div className="w-full flex items-center justify-between border-b border-surface-glass-border/20 pb-3">
          <div className="text-left">
            <h3 className="font-bold text-lg text-text-title">{title}</h3>
            {subtitle && (
              <p className="text-xs text-text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image preview"
            className="p-2 rounded-full hover:bg-muted-primary/10 text-text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Large Image View */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-inner flex items-center justify-center my-2 max-h-[65vh] overflow-hidden">
          <img
            src={imageSrc}
            alt={title}
            className="w-64 h-64 sm:w-80 sm:h-80 object-contain select-none"
          />
        </div>

        {/* Action Controls */}
        <div className="w-full flex items-center justify-end gap-3 pt-2">
          {allowDownload && (
            <Button
              buttonText="Download QR"
              buttonIcon={<FiDownload size={16} />}
              type="secondary"
              onClick={handleDownload}
            />
          )}
          <Button
            buttonText="Close"
            type="primary"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
