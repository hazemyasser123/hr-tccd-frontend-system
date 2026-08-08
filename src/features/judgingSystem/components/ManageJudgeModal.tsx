import { Modal, InputField, Button } from "tccd-ui";
import useManageJudgeModalUtils from "../utils/ManageJudgeFormUtils";

export default function ManageJudgeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    judgeDataState,
    handleChangeJudgeData,
    formErrors,
    submitJudge,
    isLoading,
  } = useManageJudgeModalUtils();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Judge">
      <p className="text-text-muted-foreground text-[13px] md:text-[14px] lg:text-[15px] mb-2 -mt-2">
        Fill in the details below to create a new judge for this event and make
        sure you copy password somewhere safe as it cannot be retrieved later.
      </p>
      <hr className="mb-4 border-surface-glass-border/10" />
      <div className="space-y-3">
        <div className="space-y-0.5">
          <InputField
            id="firstName"
            label="First Name"
            value={judgeDataState ? judgeDataState.firstName ?? "" : ""}
            placeholder="Enter judge first name"
            onChange={(e) => handleChangeJudgeData("firstName", e.target.value)}
          />
          {formErrors.find((err) => err.attr === "firstName") && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {formErrors.find((err) => err.attr === "firstName")?.value}
            </p>
          )}
        </div>
        <div className="space-y-0.5">
          <InputField
            id="lastName"
            label="Last Name"
            value={judgeDataState ? judgeDataState.lastName ?? "" : ""}
            placeholder="Enter judge last name"
            onChange={(e) => handleChangeJudgeData("lastName", e.target.value)}
          />
          {formErrors.find((err) => err.attr === "lastName") && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {formErrors.find((err) => err.attr === "lastName")?.value}
            </p>
          )}
        </div>
        <div className="space-y-0.5">
          <InputField
            id="password"
            label="Password"
            value={judgeDataState ? judgeDataState.password ?? "" : ""}
            placeholder="Enter password"
            onChange={(e) => handleChangeJudgeData("password", e.target.value)}
          />
          {formErrors.find((err) => err.attr === "password") && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {formErrors.find((err) => err.attr === "password")?.value}
            </p>
          )}
        </div>
      </div>
      <hr className="mt-6 border-surface-glass-border/10" />
      <div className="flex justify-center gap-2 mt-4">
        <Button
          type="secondary"
          buttonText="Cancel"
          width="auto"
          onClick={onClose}
        />
        <Button
          type="primary"
          buttonText="Create Judge"
          width="auto"
          onClick={submitJudge}
          loading={isLoading}
        />
      </div>
    </Modal>
  );
}
