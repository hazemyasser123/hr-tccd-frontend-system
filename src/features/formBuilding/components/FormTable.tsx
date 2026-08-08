import type { form } from "@/shared/types/form";
import Format from "@/shared/utils/Formater";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button, ButtonTypes } from "tccd-ui";
import { useEffect, useState } from "react";
import FormDeleteModal from "./FormDeleteModal";
import { useModifyFormStatus } from "@/shared/queries/forms/formQueries";
import { getErrorMessage } from "@/shared/utils";
import { useSelector } from "react-redux";

interface FormsTableProps {
  forms: form[];
}

const FormTable = ({ forms }: FormsTableProps) => {
  const navigate = useNavigate();
  const userRoles = useSelector((state: any) => state.auth?.user.roles);
  const [displayedForms, setDisplayedForms] = useState<form[]>(forms);
  const [showDeleteModal, setShowDeleteModal] = useState("");
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
    <div className="hidden lg:block overflow-x-auto">
      <FormDeleteModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
      />
      <table className="w-full">
        {/* Table Header */}
        <thead className="bg-gray-50 dark:bg-surface-glass-bg/50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#555C6C] dark:text-text-muted-foreground">
              Title
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#555C6C] dark:text-text-muted-foreground">
              Created At
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#555C6C] dark:text-text-muted-foreground">
              Updated At
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#555C6C] dark:text-text-muted-foreground whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {displayedForms && displayedForms.length > 0 ? (
            displayedForms.map((form, index) => (
              <tr
                key={form.id || index}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="font-medium text-dashboard-card-text whitespace-nowrap">
                    {form.title || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-dashboard-card-text whitespace-nowrap">
                    {Format(form.createdAt, "stringed") || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-dashboard-card-text whitespace-nowrap">
                    {Format(form.updatedAt, "stringed") || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      type={ButtonTypes.TERTIARY}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/form/${form.id}`,
                        );
                        toast.success("Form link copied to clipboard");
                      }}
                      buttonText="Copy Link"
                      width="small"
                    />
                    <Button
                      type={ButtonTypes.SECONDARY}
                      onClick={() => navigate(`/form-builder/${form.id}`)}
                      buttonText="Edit"
                      width="fit"
                    />
                    {form.isClosed ? (
                      <div className="w-20">
                        <Button
                          type={ButtonTypes.PRIMARY}
                          onClick={() => handleModifyStatus(form.id, false)}
                          buttonText="Unlock"
                          disabled={
                            modifyFormStatusMutation.isPending &&
                            modifyFormStatusMutation.variables?.formId ===
                              form.id
                          }
                          width="full"
                        />
                      </div>
                    ) : (
                      <div className="w-20">
                        <Button
                          type={ButtonTypes.PRIMARY}
                          onClick={() => handleModifyStatus(form.id, true)}
                          buttonText="Lock"
                          disabled={
                            modifyFormStatusMutation.isPending &&
                            modifyFormStatusMutation.variables?.formId ===
                              form.id
                          }
                          width="full"
                        />
                      </div>
                    )}
                    {userRoles.includes("Admin") && (
                      <Button
                        type={ButtonTypes.DANGER}
                        onClick={() => setShowDeleteModal(form.id)}
                        buttonText="Delete"
                        width="fit"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center">
                <div className="text-dashboard-description">
                  <p className="text-lg font-medium">No forms found</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FormTable;
