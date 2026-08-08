import { format } from "@/shared/utils";
import type { form } from "@/shared/types/form";
import { ButtonTypes, Button } from "tccd-ui";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import FormDeleteModal from "./FormDeleteModal";
import { useModifyFormStatus } from "@/shared/queries/forms/formQueries";
import { getErrorMessage } from "@/shared/utils";
import { IoTrashSharp } from "react-icons/io5";
import { FaRegCopy } from "react-icons/fa6";
import { FaEdit, FaLock, FaUnlock } from "react-icons/fa";
import { useSelector } from "react-redux";

interface FormCardViewProps {
  forms: form[];
}

const FormCardView = ({ forms }: FormCardViewProps) => {
  const navigate = useNavigate();
  const userRoles = useSelector((state: any) => state.auth?.user.roles);
  const [showDeleteModal, setShowDeleteModal] = useState("");
  const [displayedForms, setDisplayedForms] = useState<form[]>(forms);
  const modifyFormStatusMutation = useModifyFormStatus();

  const handleModifyStatus = (formId: string, isClosed: boolean) => {
    toast.promise(
      new Promise((resolve, reject) => {
        modifyFormStatusMutation.mutate(
          { formId, isClosed },
          {
            onSuccess: () => {
              setShowDeleteModal("");
              setDisplayedForms((prevForms) =>
                prevForms.map((form) =>
                  form.id === formId ? { ...form, isClosed } : form,
                ),
              );
              resolve(true);
            },
            onError: (error: unknown) => {
              reject(error);
            },
          },
        );
      }),
      {
        loading: isClosed ? "Closing form..." : "Opening form...",
        success: isClosed ? "Form closed" : "Form opened",
        error: (err) =>
          `Error: ${getErrorMessage(err) || "Failed to modify form status"}`,
      },
    );
  };

  useEffect(() => {
    setDisplayedForms(forms);
  }, [forms]);

  return (
    <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-700">
      <FormDeleteModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
      />
      {displayedForms && displayedForms.length > 0 ? (
        displayedForms.map((form, index) => (
          <div key={form.id || index} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-inactive-tab-text dark:text-text-title text-[16px] md:text-[18px]">
                  {form.title || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <span className="font-medium text-dashboard-heading dark:text-text-title">
                  Created At:
                </span>
                <p className="text-dashboard-card-text">
                  {format(form.createdAt, "stringed") || "N/A"}
                </p>
              </div>
              <div>
                <span className="font-medium text-dashboard-heading dark:text-text-title">
                  Updated At:
                </span>
                <p className="text-dashboard-card-text">
                  {format(form.updatedAt, "stringed") || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-center items-center gap-3">
              <Button
                type={ButtonTypes.TERTIARY}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/form/${form.id}`,
                  );
                  toast.success("Form link copied to clipboard");
                }}
                buttonIcon={<FaRegCopy size={16} />}
                width="fit"
              />
              <Button
                type={ButtonTypes.SECONDARY}
                onClick={() => navigate(`/form-builder/${form.id}`)}
                buttonIcon={<FaEdit size={16} />}
                width="fit"
              />
              {form.isClosed ? (
                <Button
                  type={ButtonTypes.PRIMARY}
                  onClick={() => handleModifyStatus(form.id, false)}
                  buttonIcon={<FaUnlock size={14} />}
                  disabled={
                    modifyFormStatusMutation.isPending &&
                    modifyFormStatusMutation.variables?.formId === form.id
                  }
                  width="fit"
                />
              ) : (
                <Button
                  type={ButtonTypes.PRIMARY}
                  onClick={() => handleModifyStatus(form.id, true)}
                  buttonIcon={<FaLock size={14} />}
                  disabled={
                    modifyFormStatusMutation.isPending &&
                    modifyFormStatusMutation.variables?.formId === form.id
                  }
                  width="fit"
                />
              )}
              {userRoles.includes("Admin") && (
                <Button
                  type={ButtonTypes.DANGER}
                  onClick={() => setShowDeleteModal(form.id || "")}
                  buttonIcon={<IoTrashSharp size={17} />}
                  width="fit"
                />
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 text-center">
          <div className="text-dashboard-description">
            <p className="text-lg font-medium">No Forms found</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormCardView;
