import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal,
  InputField,
  DropdownMenu,
  ButtonTypes,
  ButtonWidths,
  NumberField,
} from "tccd-ui";
import type { member } from "@/shared/types/member";
import {
  useCreateUser,
  useUpdateUser,
} from "@/shared/queries/users";
import {
  memberSchema,
  type MemberFormData,
} from "@/shared/schemas/memberSchemas";
import {
  COMMITTEES_OPTIONS,
  EDUCATION_SYSTEMS,
  POSITIONS,
} from "@/constants/usersConstants";
import DEPARTMENT_LIST from "@/constants/departments";
import { FaSyncAlt, FaEye, FaEyeSlash } from "react-icons/fa";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: member | null;
  mode: "create" | "edit";
  onAccountCreated?: (
    memberId: string,
    email: string,
    password: string,
  ) => void;
}

/** Determine the system role based on committee and position. Returns null if no account should be created. */
function deriveRole(committee: string, position: string): string | null {
  if (committee === "HumanResources") return "HR";
  if (committee === "HighBoard") return "HighBoard";
  if (position === "Head") return "Head";
  return null;
}

/** Generate a secure random password */
function generateRandomPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}";
  const length = 16;
  let password = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

const UserManageModal = ({
  isOpen,
  onClose,
  user,
  mode,
  onAccountCreated,
}: UserModalProps) => {
  const [formData, setFormData] = useState<MemberFormData>({
    id: "",
    name: "",
    email: "",
    phoneNumber: "",
    committee: "",
    position: "",
    nationalId: "",
    engineeringMajor: "",
    educationSystem: "",
    gradYear: new Date().getFullYear(),
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof MemberFormData, string>>
  >({});

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isLoading =
    createUserMutation.isPending ||
    updateUserMutation.isPending;
    
  const derivedRole = deriveRole(formData.committee, formData.position || "");
  const shouldCreateAccount = mode === "create" && derivedRole !== null;

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && user) {
        setFormData({
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          committee: user.committee,
          position: user.position || "",
          nationalId: user.nationalId,
          engineeringMajor: user.engineeringMajor,
          educationSystem: user.educationSystem,
          gradYear: user.gradYear,
        });
      } else {
        setFormData({
          id: "",
          name: "",
          email: "",
          phoneNumber: "",
          committee: "",
          position: "",
          nationalId: "",
          engineeringMajor: "",
          educationSystem: "",
          gradYear: new Date().getFullYear(),
        });
        setPassword("");
      }
      setErrors({});
    }
  }, [isOpen, mode, user]);

  const handleInputChange = (field: keyof MemberFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleGeneratePassword = useCallback(() => {
    setPassword(generateRandomPassword());
  }, []);

  const validateForm = (): boolean => {
    const result = memberSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof MemberFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof MemberFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (shouldCreateAccount && !password) {
      setErrors((prev) => ({ ...prev }));
      // Show a toast-like inline error for password
      alert("Please enter or generate a password for the system account.");
      return;
    }

    const memberData: member = {
      id: formData.id || "",
      name: formData.name.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      committee: formData.committee,
      position: formData.position,
      nationalId: formData.nationalId.trim(),
      engineeringMajor: formData.engineeringMajor,
      educationSystem: formData.educationSystem,
      gradYear: formData.gradYear,
    };

    try {
      if (mode === "create") {
        const createResult = await createUserMutation.mutateAsync({
          userData: memberData,
          password: password === "" ? undefined : password,
        });

          // Notify parent so it can show credentials modal
        onAccountCreated?.(createResult.id, memberData.email, password);
      } else if (mode === "edit" && user) {
        await updateUserMutation.mutateAsync({
          userId: user.id,
          userData: memberData,
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save member:", error);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      title={mode === "create" ? "Add New Member" : "Edit Member"}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div id="member-form" className="flex flex-col gap-4 p-1">
        <div className="space-y-1">
          <InputField
            labelClassName="text-contrast text-[14px] md:text-[14px] lg:text-[15px] mb-1"
            label="Full Name"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={errors.name}
            placeholder="Enter full name"
          />
        </div>

        <div className="space-y-1">
          <InputField
            labelClassName="text-contrast text-[14px] md:text-[14px] lg:text-[15px] mb-1"
            label="Email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={errors.email}
            placeholder="Enter email address"
          />
        </div>

        <div className="space-y-1">
          <InputField
            labelClassName="text-contrast text-[14px] md:text-[14px] lg:text-[15px] mb-1"
            label="Phone Number"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            error={errors.phoneNumber}
            placeholder="01xxxxxxxxx"
          />
        </div>

        <div className="space-y-1">
          <InputField
            labelClassName="text-contrast text-[14px] md:text-[14px] lg:text-[15px] mb-1"
            label="National ID"
            id="nationalId"
            value={formData.nationalId}
            onChange={(e) => handleInputChange("nationalId", e.target.value)}
            error={errors.nationalId}
            placeholder="Enter 14-digit national ID"
          />
        </div>

        <div className="space-y-1">
          <NumberField
            id="gradYear"
            labelClassName="text-contrast text-[14px] md:text-[14px] lg:text-[15px] mb-1"
            label="Graduation Year"
            value={formData.gradYear.toString()}
            onChange={(value) =>
              handleInputChange(
                "gradYear",
                typeof value === "number" ? value.toString() : value,
              )
            }
            error={errors.gradYear}
            placeholder="Enter graduation year"
          />
        </div>

        <div className="space-y-1">
          <DropdownMenu
            labelClassName="text-contrast text-[14px] md:text-[14px] lg:text-[15px] mb-1"
            label="Committee"
            id="committee"
            value={formData.committee}
            onChange={(value) => handleInputChange("committee", value)}
            options={COMMITTEES_OPTIONS}
            error={errors.committee}
            disabled={isLoading}
            placeholder="Select committee"
          />
        </div>

        <div className="space-y-1">
          <DropdownMenu
            labelClassName="text-contrast text-[14px] md:text-[14px] lg:text-[15px] mb-1"
            label="Position"
            id="position"
            value={formData.position || ""}
            onChange={(value) => handleInputChange("position", value)}
            options={POSITIONS}
            error={errors.position}
            disabled={isLoading}
            placeholder="Select position"
          />
        </div>

        <div className="space-y-1">
          <DropdownMenu
            labelClassName="text-contrast text-[14px] md:text-[14px] lg:text-[15px] mb-1"
            label="Engineering Major"
            id="engineeringMajor"
            value={formData.engineeringMajor}
            onChange={(value) => handleInputChange("engineeringMajor", value)}
            options={DEPARTMENT_LIST}
            error={errors.engineeringMajor}
            disabled={isLoading}
            placeholder="Select engineering major"
          />
        </div>

        <div className="space-y-1">
          <DropdownMenu
            labelClassName="text-contrast text-[14px] md:text-[14px] lg:text-[15px] mb-1"
            label="Education System"
            id="educationSystem"
            value={formData.educationSystem}
            onChange={(value) => handleInputChange("educationSystem", value)}
            options={EDUCATION_SYSTEMS}
            error={errors.educationSystem}
            disabled={isLoading}
            placeholder="Select education system"
          />
        </div>

        {/* System Account Section — only shown in create mode when role is determined */}
        {shouldCreateAccount && (
          <div className="mt-2 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400 text-[13px] font-semibold uppercase tracking-wide">
                System Account
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                Role: {derivedRole}
              </span>
            </div>
            <p className="text-[12px] text-text-muted-foreground dark:text-gray-400">
              This member will receive a system login account. Set a password
              below.
            </p>
            <div className="space-y-1">
              <label className="text-contrast text-[14px] mb-1 block font-medium">
                Password
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter or generate a password"
                    className="w-full px-3 py-2 pr-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-glass-bg text-contrast dark:text-text-title text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={14} />
                    ) : (
                      <FaEye size={14} />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors whitespace-nowrap"
                >
                  <FaSyncAlt size={12} />
                  Generate
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            buttonText="Cancel"
            type={ButtonTypes.SECONDARY}
            width={ButtonWidths.FULL}
            onClick={handleClose}
            disabled={isLoading}
          />
          <Button
            buttonText={mode === "create" ? "Add Member" : "Save Changes"}
            type={ButtonTypes.PRIMARY}
            width={ButtonWidths.FULL}
            disabled={isLoading}
            loading={isLoading}
            onClick={() => handleSubmit()}
          />
        </div>
      </div>
    </Modal>
  );
};

export default UserManageModal;
