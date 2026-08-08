import {
  useGetMembers,
  useDeleteUser,
  useDeleteAccount,
  useSendQRCode,
} from "@/shared/queries/users";
import { useState, useMemo } from "react";
import { Button, DropdownMenu, SearchField } from "tccd-ui";
import { FaChevronLeft, FaChevronRight, FaKey } from "react-icons/fa";
import { BsQrCode } from "react-icons/bs";
import {
  USERS_SORTING_OPTIONS,
  TEAM_COMMITTEES,
  POSITIONS,
} from "@/constants/usersConstants";
import Table from "@/shared/components/table/Table";
import CardView from "@/shared/components/table/CardView";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { member } from "@/shared/types/member";
import { IoTrashSharp } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import UserCredentialsModal from "./UserCredentialsModal";

const PAGE_SIZE = 10;

interface CredentialEntry {
  memberId: string;
  memberName: string;
  email: string;
  password: string;
}

const currentYear = new Date().getFullYear();
const GRAD_YEAR_OPTIONS = [
  { label: "All Years", value: "All" },
  ...Array.from({ length: currentYear - 2017 }, (_, i) => {
    const y = currentYear + 2 - i;
    return { label: String(y), value: String(y) };
  }),
];

const POSITION_FILTER_OPTIONS = [
  { label: "All Positions", value: "All" },
  ...POSITIONS,
];

const UserList = ({
  setModalOpen,
  accountsCreated,
}: {
  setModalOpen: React.Dispatch<React.SetStateAction<member | null>>;
  accountsCreated: CredentialEntry[];
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCommittee, setFilterCommittee] = useState("All");
  const [filterPosition, setFilterPosition] = useState("All");
  const [filterGradYear, setFilterGradYear] = useState("All");
  const [sortOption, setSortOption] = useState("");
  const [credentialsModal, setCredentialsModal] =
    useState<CredentialEntry | null>(null);
  const userRoles = useSelector((state: any) => state.auth.user?.roles || []);

  const deleteUserMutation = useDeleteUser();
  const deleteAccountMutation = useDeleteAccount();
  const sendQRCodeMutation = useSendQRCode();

  const handleSearchChange = (value: string) => {
    setUserSearchTerm(value);
    setCurrentPage(1);
    clearTimeout((handleSearchChange as any)._timer);
    (handleSearchChange as any)._timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 400);
  };

  const resetPage = () => setCurrentPage(1);

  const { data, isLoading, isError } = useGetMembers({
    page: currentPage,
    count: PAGE_SIZE,
    name: debouncedSearch || undefined,
    committee: filterCommittee !== "All" ? filterCommittee : undefined,
    position: filterPosition !== "All" ? filterPosition : undefined,
    graduationYear:
      filterGradYear !== "All" ? Number(filterGradYear) : undefined,
  });

  const rawMembers = data?.members ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasNextPage = data?.hasNextPage ?? false;
  const hasPreviousPage = data?.hasPreviousPage ?? false;

  const members = useMemo(() => {
    if (!sortOption) return rawMembers;
    return [...rawMembers].sort((a: member, b: member) => {
      switch (sortOption) {
        case "az":
          return a.name.localeCompare(b.name);
        case "za":
          return b.name.localeCompare(a.name);
        case "caz":
          return a.committee.localeCompare(b.committee);
        case "cza":
          return b.committee.localeCompare(a.committee);
        default:
          return 0;
      }
    });
  }, [rawMembers, sortOption]);

  const handleSendQRCode = (userId: string) => {
    sendQRCodeMutation.mutate(userId, {
      onSuccess: () => toast.success("QR code sent successfully"),
      onError: () => toast.error("Failed to send QR code"),
    });
  };

  const handleDelete = (userId: string) => {
    const memberEntry = accountsCreated.find((a) => a.memberId === userId);
    const hasAccount = !!memberEntry;

    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        toast.success("Member deleted successfully");
        if (hasAccount) {
          deleteAccountMutation.mutate(userId, {
            onSuccess: () => toast.success("System account also removed"),
          });
        }
      },
      onError: () => toast.error("Failed to delete member"),
    });
  };

  const getCredentials = (memberId: string): CredentialEntry | undefined =>
    accountsCreated.find((a) => a.memberId === memberId);

  return (
    <>
      {credentialsModal && (
        <UserCredentialsModal
          isOpen={!!credentialsModal}
          onClose={() => setCredentialsModal(null)}
          memberName={credentialsModal.memberName}
          email={credentialsModal.email}
          password={credentialsModal.password}
        />
      )}
      <div className="bg-white dark:bg-surface-glass-bg rounded-lg shadow-sm border border-dashboard-card-border overflow-hidden">
        <div className="p-4 border-b border-dashboard-border space-y-2">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-md md:text-lg lg:text-xl font-bold text-text-muted-foreground">
              Members {total > 0 ? `(${total})` : ""}
            </p>
            <div className="flex gap-2 items-center justify-center">
              <FaChevronLeft
                className={`cursor-pointer size-4 ${!hasPreviousPage ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-contrast hover:text-primary"}`}
                onClick={() => {
                  if (hasPreviousPage) setCurrentPage((p) => p - 1);
                }}
              />
              <span className="text-[14px] md:text-[15px] lg:text-[16px] font-medium text-contrast dark:text-text-title">
                Page {currentPage} / {totalPages || 1}
              </span>
              <FaChevronRight
                className={`cursor-pointer size-4 ${!hasNextPage ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-contrast hover:text-primary"}`}
                onClick={() => {
                  if (hasNextPage) setCurrentPage((p) => p + 1);
                }}
              />
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />
          <p className="text-[14px] md:text-[15px] lg:text-[16px] font-semibold text-contrast dark:text-text-title">
            Filters
          </p>

          {/* Search + Sort row */}
          <div className="flex gap-2 md:flex-row flex-col">
            <div className="flex-1">
              <SearchField
                placeholder="Search by name..."
                value={userSearchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex-1">
              <DropdownMenu
                options={TEAM_COMMITTEES}
                value={filterCommittee}
                onChange={(val) => {
                  setFilterCommittee(val);
                  resetPage();
                }}
                placeholder="Filter by Committee"
              />
            </div>
            <div className="flex-1">
              <DropdownMenu
                options={POSITION_FILTER_OPTIONS}
                value={filterPosition}
                onChange={(val) => {
                  setFilterPosition(val);
                  resetPage();
                }}
                placeholder="Filter by Position"
              />
            </div>
            <div className="flex-1">
              <DropdownMenu
                options={GRAD_YEAR_OPTIONS}
                value={filterGradYear}
                onChange={(val) => {
                  setFilterGradYear(val);
                  resetPage();
                }}
                placeholder="Filter by Grad Year"
              />
            </div>
            <div className="md:w-48">
              <DropdownMenu
                options={USERS_SORTING_OPTIONS}
                value={sortOption}
                onChange={(val) => setSortOption(val)}
                placeholder="Sort By"
              />
            </div>
          </div>

        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-contrast dark:text-text-title">
              Loading members...
            </p>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-contrast dark:text-text-title">
              Error loading Members. Please try again.
            </p>
          </div>
        ) : (
          <>
            <Table
              items={members}
              modalTitle="Delete Member"
              modalSubTitle="Are you sure you want to delete this member? This action cannot be undone."
              isSubmitting={deleteUserMutation.isPending}
              confirmationAction={(user) => handleDelete(user.id)}
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "phoneNumber", label: "Phone Number" },
                { key: "nationalId", label: "National ID" },
                { key: "gradYear", label: "Graduation Year" },
                {
                  key: "committee",
                  label: "Committee",
                  formatter: (value) =>
                    TEAM_COMMITTEES.find((c) => c.value === value)?.label ||
                    value,
                },
                { key: "position", label: "Position" },
              ]}
              emptyMessage="No members found."
              renderActions={(item, triggerDelete) => (
                <>            
                  <Button
                    type="tertiary"
                    onClick={() => handleSendQRCode(item.id)}
                    buttonText="Send QR"
                    width="fit"
                    loading={sendQRCodeMutation.isPending}
                  />
                  {getCredentials(item.id) && (
                    <Button
                      type="secondary"
                      onClick={() =>
                        setCredentialsModal(getCredentials(item.id)!)
                      }
                      buttonIcon={<FaKey size={14} />}
                      buttonText="Credentials"
                      width="fit"
                    />
                  )}
                  {userRoles.includes("Admin") && (
                    <>
                      <Button
                        type="secondary"
                        onClick={() => setModalOpen(item)}
                        buttonText="Edit"
                        width="fit"
                      />
                      <Button
                        type="danger"
                        onClick={() => triggerDelete(item.id)}
                        buttonText="Delete"
                        width="fit"
                      />
                    </>
                  )}
                </>
              )}
            />

            <CardView
              items={members}
              titleKey="name"
              renderedFields={[
                { key: "email", label: "Email" },
                { key: "phoneNumber", label: "Phone Number" },
                { key: "nationalId", label: "National ID" },
                { key: "gradYear", label: "Graduation Year" },
                {
                  key: "committee",
                  label: "Committee",
                  formatter: (value) =>
                    TEAM_COMMITTEES.find((c) => c.value === value)?.label ||
                    value,
                },
                { key: "position", label: "Position" },
              ]}
              renderButtons={(item, triggerDelete) => (
                <>
                  <Button
                    type="tertiary"
                    onClick={() => handleSendQRCode(item.id)}
                    buttonIcon={<BsQrCode size={15} />}
                    width="fit"
                    loading={sendQRCodeMutation.isPending}
                  />
                  {getCredentials(item.id) && (
                    <Button
                      type="secondary"
                      onClick={() =>
                        setCredentialsModal(getCredentials(item.id)!)
                      }
                      buttonIcon={<FaKey size={14} />}
                      width="fit"
                    />
                  )}
                  {userRoles.includes("Admin") && (
                    <>
                      <Button
                        type="secondary"
                        onClick={() => setModalOpen(item)}
                        buttonIcon={<FaEdit size={16} />}
                        width="fit"
                      />
                      <Button
                        type="danger"
                        onClick={() => triggerDelete(item.id)}
                        buttonIcon={<IoTrashSharp size={16} />}
                        width="fit"
                      />
                    </>
                  )}
                </>
              )}
              emptyMessage="No members found."
              modalTitle="Delete Member"
              modalSubTitle="Are you sure you want to delete this member? This action cannot be undone."
              isSubmitting={deleteUserMutation.isPending}
              confirmationAction={(user) => handleDelete(user.id)}
            />
          </>
        )}
      </div>
    </>
  );
};

export default UserList;
