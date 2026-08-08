import { Modal, Button, InputField } from "tccd-ui";
import { useState } from "react";
import { useResetJudgePassword } from "@/shared/queries/judgingSystem/judgeQueries";
import toast from "react-hot-toast";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  judgeId: string;
  judgeName: string;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  judgeId,
  judgeName,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const resetPasswordMutation = useResetJudgePassword();

  const handleReset = () => {
    if (!password) {
      toast.error("Please enter a new password.");
      return;
    }

    resetPasswordMutation.mutate(
      { judgeId, password },
      {
        onSuccess: () => {
          toast.success(`Password for ${judgeName} reset successfully.`);
          setPassword("");
          onClose();
        },
        onError: () => {
          toast.error("Failed to reset password. Please try again.");
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reset Password for ${judgeName}`}>
      <div className="space-y-4 mt-2 w-full">
        <p className="text-[14px] md:text-[15px] lg:text-[16px] text-text-muted-foreground">
          Enter the new password for the judge:
        </p>
        <InputField
          id="new-password"
          label="New Password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button type="secondary" onClick={onClose} buttonText="Cancel" />
          <Button
            type="primary"
            onClick={handleReset}
            buttonText="Reset Password"
            loading={resetPasswordMutation.isPending}
            disabled={!password || resetPasswordMutation.isPending}
          />
        </div>
      </div>
    </Modal>
  );
}
