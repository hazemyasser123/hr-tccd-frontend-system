import { useGetMembers } from "@/shared/queries/users";
import { useState } from "react";
import { DropdownMenu, SearchField } from "tccd-ui";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  USERS_SORTING_OPTIONS,
  TEAM_COMMITTEES,
  POSITIONS,
} from "@/constants/usersConstants";
import Table from "@/shared/components/table/Table";
import CardView from "@/shared/components/table/CardView";
import type { Committee, Position } from "@/shared/types/user";

const PAGE_SIZE = 10;

const currentYear = new Date().getFullYear();
const minYear = currentYear - 2;
const maxYear = currentYear + 5;
//const startYear = 2017;

const GRAD_YEAR_OPTIONS = [
  { label: "All Years", value: "All" },
  ...Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
    const y = maxYear - i;
    return { label: String(y), value: String(y) };
  }),
];

const POSITION_FILTER_OPTIONS = [
  { label: "All Positions", value: "All" },
  ...POSITIONS,
];

const UserList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCommittee, setFilterCommittee] = useState("All");
  const [filterPosition, setFilterPosition] = useState("All");
  const [filterGradYear, setFilterGradYear] = useState("All");
  const [sortOption, setSortOption] = useState("");

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
    committee: (filterCommittee !== "All"
      ? filterCommittee
      : undefined) as Committee | undefined,
    position: (filterPosition !== "All"
      ? filterPosition
      : undefined) as Position | undefined,
    graduationYear:
      filterGradYear !== "All" ? Number(filterGradYear) : undefined,
    sortBy: sortOption || undefined,
  });

  const members = data?.members ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasNextPage = data?.hasNextPage ?? false;
  const hasPreviousPage = data?.hasPreviousPage ?? false;


  return (
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
            emptyMessage="No members found."
          />
        </>
      )}
    </div>
  );
};

export default UserList;
