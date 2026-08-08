import { useState, useEffect } from "react";
import { Modal, TextAreaField, Button } from "tccd-ui";

interface ReasonPopupProps {
  isOpen: boolean;
  onClose: (status: number, reason?: string) => void;
  title: string;
  prompt: string;
  id?: string;
  label?: string;
  initialReason?: string;
  /** If provided, called on submit. Popup stays open until the promise resolves. */
  onSubmit?: (reason: string) => Promise<void>;
}

export default function ReasonPopup({
  isOpen,
  onClose,
  title,
  prompt,
  id = "reason-popup-textarea",
  label = "Reason",
  initialReason = "",
  onSubmit,
}: ReasonPopupProps) {
  const [reason, setReason] = useState<string>(initialReason);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setReason(initialReason || "");
  }, [isOpen, initialReason]);

  function handleCancel() {
    if (isSubmitting) return;
    onClose(1);
  }

  async function handleSubmit() {
    if (reason.trim() === "") return;
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(reason);
        onClose(0, reason);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onClose(0, reason);
    }
  }

  return (
    <Modal title={title} isOpen={isOpen} onClose={handleCancel}>
      <div className="p-4 sm:p-6 md:p-8 space-y-4">
        <p className="text-base sm:text-lg md:text-xl font-medium mb-2">
          {prompt}
        </p>

        <TextAreaField
          id={id}
          label={label}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason here."
        />

        <div className="flex justify-between mt-6">
          <Button
            buttonText="Cancel"
            onClick={handleCancel}
            type="ghost"
            disabled={isSubmitting}
          />
          <Button
            buttonText={isSubmitting ? "Submitting..." : "Submit"}
            onClick={handleSubmit}
            type="primary"
            disabled={reason.trim() === "" || isSubmitting}
            loading={isSubmitting}
          />
        </div>
      </div>
    </Modal>
  );
}
