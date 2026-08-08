import { useState } from "react";
import { Modal, Button, ButtonTypes } from "tccd-ui";
import { FaCopy, FaCheck, FaKey } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface UserCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  email: string;
  password: string;
}

const UserCredentialsModal = ({
  isOpen,
  onClose,
  memberName,
  email,
  password,
}: UserCredentialsModalProps) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = async (text: string, type: "email" | "password") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  return (
    <Modal title="System Account Credentials" isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-5 p-1">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <FaKey className="text-blue-600 dark:text-blue-400" size={14} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-contrast dark:text-text-title">
              {memberName}
            </p>
            <p className="text-[12px] text-text-muted-foreground dark:text-gray-400">
              Share these credentials securely
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-contrast dark:text-text-title block">
            Email
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-glass-bg text-[14px] text-contrast dark:text-text-title font-mono select-all">
              {email}
            </div>
            <button
              onClick={() => copyToClipboard(email, "email")}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                copiedEmail
                  ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                  : "bg-gray-100 dark:bg-gray-800 text-contrast dark:text-text-title hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {copiedEmail ? <FaCheck size={12} /> : <FaCopy size={12} />}
              {copiedEmail ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-contrast dark:text-text-title block">
            Password
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-glass-bg">
              <span className="flex-1 text-[14px] text-contrast dark:text-text-title font-mono select-all">
                {showPassword
                  ? password
                  : "•".repeat(Math.min(password.length, 20))}
              </span>
              <button
                onClick={() => setShowPassword((v) => !v)}
                className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            <button
              onClick={() => copyToClipboard(password, "password")}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                copiedPassword
                  ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                  : "bg-gray-100 dark:bg-gray-800 text-contrast dark:text-text-title hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {copiedPassword ? <FaCheck size={12} /> : <FaCopy size={12} />}
              {copiedPassword ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-text-muted-foreground dark:text-gray-500 text-center">
          📸 Take a screenshot to share these credentials securely.
        </p>

        <Button
          buttonText="Close"
          type={ButtonTypes.SECONDARY}
          onClick={onClose}
        />
      </div>
    </Modal>
  );
};

export default UserCredentialsModal;
