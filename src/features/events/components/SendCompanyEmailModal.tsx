import { useState, useEffect } from "react";
import { Button, InputField, Modal } from "tccd-ui";
import { useSendCompanyCateringAllocationsEmail } from "@/shared/queries/companies";
import toast from "react-hot-toast";
import { IoAdd, IoTrashSharp } from "react-icons/io5";

interface SendCompanyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  companyId: string;
  companyName: string;
}

const SendCompanyEmailModal = ({
  isOpen,
  onClose,
  eventId,
  companyId,
  companyName,
}: SendCompanyEmailModalProps) => {
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([""]);
  const sendEmailMutation = useSendCompanyCateringAllocationsEmail();

  useEffect(() => {
    if (!isOpen) {
      setAdditionalEmails([""]);
    }
  }, [isOpen]);

  const handleAddEmail = () => {
    setAdditionalEmails([...additionalEmails, ""]);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...additionalEmails];
    newEmails[index] = value;
    setAdditionalEmails(newEmails);
  };

  const handleRemoveEmail = (index: number) => {
    setAdditionalEmails(additionalEmails.filter((_, i) => i !== index));
  };

  const handleSendEmail = async () => {
    try {
      const emailList = additionalEmails
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const result = await sendEmailMutation.mutateAsync({
        eventId,
        companyId,
        additionalEmails: emailList,
      });
      toast.success(
        `Email sent successfully! Requested: ${result.requestedCount}, Sent: ${result.sentCount}`
      );
      onClose();
      setAdditionalEmails([""]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send email");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Send Email to ${companyName}`}
    >
      <div className="space-y-4 p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This will send an email with the catering allocation to {companyName}.
          You can optionally provide additional email addresses to receive a copy.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Additional Emails
            </label>
            <button
              type="button"
              onClick={handleAddEmail}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            >
              <IoAdd size={16} />
              Add Email
            </button>
          </div>

          {additionalEmails.length === 0 && (
            <p className="text-xs text-gray-400 italic">No additional emails added.</p>
          )}

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {additionalEmails.map((email, index) => (
              <div key={index} className="flex flex-row items-end gap-2">
                <div className="flex-1">
                  <InputField
                    id={`additional-email-${index}`}
                    label=""
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(index)}
                  className="flex-none p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
                  title="Remove email"
                >
                  <IoTrashSharp size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button buttonText="Cancel" onClick={onClose} type="secondary" />
          <Button
            buttonText="Send Email"
            onClick={handleSendEmail}
            type="primary"
            disabled={sendEmailMutation.isPending}
          />
        </div>
      </div>
    </Modal>
  );
};

export default SendCompanyEmailModal;
