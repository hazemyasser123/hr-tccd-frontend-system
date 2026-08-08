import { Button, Modal, SearchField } from "tccd-ui";
import { useState } from "react";
import {
  useFormAccessList,
  useGrantFormAccess,
  useRevokeFormAccess,
} from "@/shared/queries/forms/formQueries";
import { useGetHRUsers } from "@/shared/queries/users";
import type { MemberData } from "@/shared/types/attendance";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function FormAccessList({
  isOpen,
  onClose,
  formId,
}: {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
}) {
  const [nameKey, setNameKey] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: accessList,
    isError: isAccessListError,
    refetch: refetchAccessList,
  } = useFormAccessList(formId, nameKey, 1, 100);
  const {
    data: members,
    isLoading,
    isError: isMembersError,
  } = useGetHRUsers(nameKey, currentPage, 10);
  const grantFormAccessMutation = useGrantFormAccess();
  const revokeFormAccessMutation = useRevokeFormAccess();

  const handleAccessManagement = (
    memberId: string,
    mode: "grant" | "revoke",
  ) => {
    if (mode === "grant") {
      toast.promise(
        grantFormAccessMutation.mutateAsync({ formId, userId: memberId }),
        {
          loading: "Granting access...",
          success: () => {
            refetchAccessList();
            return "Access granted successfully!";
          },
          error: (err) =>
            `Error granting access: ${
              err instanceof Error ? err.message : String(err)
            }`,
        },
      );
    } else {
      toast.promise(
        revokeFormAccessMutation.mutateAsync({ formId, userId: memberId }),
        {
          loading: "Revoking access...",
          success: () => {
            refetchAccessList();
            return "Access revoked successfully!";
          },
          error: (err) =>
            `Error revoking access: ${
              err instanceof Error ? err.message : String(err)
            }`,
        },
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Form Access List">
      <div>
        <p className="mb-4 dark:text-text-body-main">
          Manage who can view or modify this form
        </p>
        <SearchField
          placeholder="Search users..."
          onChange={(value) => setNameKey(value)}
          value={nameKey}
          className="lg:w-full"
        />
        <div className="shadow-md bg-white dark:bg-surface-glass-bg rounded-lg w-full mt-4 pb-4">
          <div className="overflow-x-auto max-h-[465px]">
            {isLoading ? (
              <p className="p-4 text-center">Loading...</p>
            ) : isAccessListError || isMembersError ? (
              <p className="p-4 text-center">Error loading access list.</p>
            ) : members?.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-surface-glass-bg/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted-foreground uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted-foreground uppercase tracking-wider"
                    >
                      Team
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-text-muted-foreground uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-surface-glass-bg divide-y divide-gray-200 dark:divide-gray-200/5">
                  {members?.map((member: MemberData) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-text-body-main">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-text-body-main">
                        {member.committee}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-text-body-main">
                        <Button
                          loading={
                            grantFormAccessMutation.isPending ||
                            revokeFormAccessMutation.isPending
                          }
                          type={
                            accessList?.find(
                              (user: MemberData) => user.id === member.id,
                            )
                              ? "secondary"
                              : "primary"
                          }
                          buttonText={
                            accessList?.find(
                              (user: MemberData) => user.id === member.id,
                            )
                              ? "Remove Access"
                              : "Grant Access"
                          }
                          onClick={() =>
                            handleAccessManagement(
                              member.id,
                              accessList?.find(
                                (user: MemberData) => user.id === member.id,
                              )
                                ? "revoke"
                                : "grant",
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-center">No users found.</p>
            )}
          </div>
          {members &&
            members?.length > 0 &&
            !isLoading &&
            !isMembersError &&
            !isAccessListError && (
              <div className="flex justify-center gap-2 items-center mt-4">
                <FaChevronLeft
                  className={`cursor-pointer ${
                    currentPage === 1
                      ? "text-gray-300 dark:text-gray-600"
                      : "text-gray-700 dark:text-text-title"
                  }`}
                  onClick={() => {
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
                <span>Page {currentPage}</span>
                <FaChevronRight
                  className={`cursor-pointer ${
                    members && members.length < 10
                      ? "text-gray-300 dark:text-gray-600"
                      : "text-gray-700 dark:text-text-title"
                  }`}
                  onClick={() => {
                    if (members && members.length === 10)
                      setCurrentPage(currentPage + 1);
                  }}
                />
              </div>
            )}
        </div>
      </div>
    </Modal>
  );
}
