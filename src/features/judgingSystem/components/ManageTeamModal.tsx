import type { Team } from "@/shared/types/judgingSystem";
import { Modal, InputField, Button, DropdownMenu } from "tccd-ui";
import { HiOutlineTrash } from "react-icons/hi2";
import useManageTeamModalUtils from "../utils/ManageTeamFormUtils";
import DEPARTMENT_LIST from "@/constants/departments";
import { FaPlus } from "react-icons/fa6";
import { HiOutlineUpload } from "react-icons/hi";

export default function ManageTeamModal({
  isOpen,
  onClose,
  mode,
  teamData,
  eventId,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: number;
  teamData?: Team;
  eventId: string;
}) {
  const {
    teamDataState,
    handleAddMember,
    handleDeleteMember,
    handleChangeMemberName,
    handleChangeTeamData,
    formErrors,
    submitTeam,
    isLoading,
    handleFileUpload,
    isProcessingFile,
    uploadError,
  } = useManageTeamModalUtils(eventId, mode, teamData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 1 ? "Create New Team" : "Edit Team"}
    >
      <p className="text-text-muted-foreground text-[13px] md:text-[14px] lg:text-[15px] mb-2 -mt-3">
        Fill in the details below to create a new team for this event.
      </p>
      <hr className="mb-4 border-surface-glass-border/10" />

      {/* Bulk Upload Section - Only show in create mode */}
      {mode === 1 && (
        <>
          <div className="space-y-3 md:mb-6 mb-4">
            <p className="text-[16px] md:text-[17px] lg:text-[18px] font-semibold text-text-title">
              Bulk Upload
            </p>
            <p className="text-text-muted-foreground text-[13px] md:text-[14px] lg:text-[15px] -mt-1">
              Upload an Excel file to create multiple teams at once.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  accept=".xlsx,.xls,.csv,.ods"
                  onChange={handleFileUpload}
                  disabled={isProcessingFile}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center gap-2 px-4 py-2 border border-surface-glass-border/20 rounded-lg cursor-pointer hover:bg-muted-primary/5 transition-colors ${
                    isProcessingFile ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <HiOutlineUpload className="size-5 text-primary" />
                  <span className="text-[14px] md:text-[15px] text-text-body-main">
                    {isProcessingFile
                      ? "Processing..."
                      : "Choose File (Excel/CSV)"}
                  </span>
                </label>
              </div>
              {uploadError && (
                <p className="text-red-500 text-sm">{uploadError}</p>
              )}
              <p className="text-text-muted-foreground text-xs">
                Accepts: Excel (.xlsx, .xls), CSV (.csv), or OpenDocument (.ods)
                files
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 my-4">
            <hr className="flex-1 border-surface-glass-border/10" />
            <span className="text-text-muted-foreground text-sm">OR</span>
            <hr className="flex-1 border-surface-glass-border/10" />
          </div>
        </>
      )}

      <div className="space-y-3 md:mb-8 mb-6">
        <div className="flex justify-between items-center">
          <p className="text-[16px] md:text-[17px] lg:text-[18px] font-semibold text-text-title">
            Team Information
          </p>
        </div>
        <div className="space-y-0.5">
          <InputField
            id="teamName"
            label="Team Name"
            value={teamDataState ? teamDataState.name : ""}
            placeholder="Enter team name"
            onChange={(e) => handleChangeTeamData("name", e.target.value)}
          />
          {formErrors.find((err) => err.attr === "name") && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {formErrors.find((err) => err.attr === "name")?.value}
            </p>
          )}
        </div>
        <div className="space-y-0.5">
          <DropdownMenu
            id="department"
            label="Department"
            options={DEPARTMENT_LIST}
            value={teamDataState ? teamDataState.department : ""}
            placeholder="Select Department"
            onChange={(option) => handleChangeTeamData("department", option)}
          />
          {formErrors.find((err) => err.attr === "department") && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {formErrors.find((err) => err.attr === "department")?.value}
            </p>
          )}
        </div>
        <div className="space-y-0.5">
          <InputField
            id="teamCode"
            label="Team Code"
            value={teamDataState ? teamDataState.code : ""}
            placeholder="Enter team code"
            onChange={(e) => handleChangeTeamData("code", e.target.value)}
          />
          {formErrors.find((err) => err.attr === "code") && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {formErrors.find((err) => err.attr === "code")?.value}
            </p>
          )}
        </div>
        <div className="space-y-0.5">
          <InputField
            id="course"
            label="Course"
            value={teamDataState ? teamDataState.course : ""}
            placeholder="Enter course name"
            onChange={(e) => handleChangeTeamData("course", e.target.value)}
          />
          {formErrors.find((err) => err.attr === "course") && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {formErrors.find((err) => err.attr === "course")?.value}
            </p>
          )}
        </div>
      </div>
      <hr className="mb-4 border-surface-glass-border/10" />
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[16px] md:text-[17px] lg:text-[18px] font-semibold text-text-title">
              Team Members
            </p>
            <Button
              type="primary"
              buttonIcon={<FaPlus className="size-4" />}
              width="fit"
              onClick={handleAddMember}
            />
          </div>
          {teamDataState?.teamMembers &&
          teamDataState.teamMembers.length === 0 ? (
            <p className="text-text-muted-foreground text-[14px] md:text-[15px] lg:text-[16px]">
              No team members added yet.
            </p>
          ) : (
            <div className="max-h-[272px] overflow-auto space-y-2">
              {teamDataState &&
                teamDataState.teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex justify-between px-3 p-2 border border-surface-glass-border/20 rounded-full"
                  >
                    <div className="flex justify-center items-center lg:text-[16px] md:text-[15px] text-[14px] font-medium text-text-body-main">
                      <input
                        placeholder={`Member ${index + 1}`}
                        className="h-full w-full px-2 focus:outline-none bg-transparent"
                        onChange={(e) =>
                          handleChangeMemberName(member.id, e.target.value)
                        }
                        value={member.name}
                      />
                    </div>
                    <HiOutlineTrash
                      className="lg:size-4.5 text-primary cursor-pointer"
                      onClick={() => handleDeleteMember(member.id)}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      <hr className="mt-3 md:mt-5 border-surface-glass-border/10" />
      <div className="flex justify-center gap-2 mt-4">
        <Button
          type="secondary"
          buttonText="Cancel"
          width="auto"
          onClick={onClose}
        />
        <Button
          type="primary"
          buttonText={mode === 1 ? "Create Team" : "Save Changes"}
          width="auto"
          onClick={submitTeam}
          loading={isLoading}
        />
      </div>
    </Modal>
  );
}
