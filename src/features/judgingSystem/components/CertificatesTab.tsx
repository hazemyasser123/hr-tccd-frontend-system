import { Button, DropdownMenu } from "tccd-ui";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useResearchTeams,
  useUpdateTeamStatus,
} from "@/shared/queries/judgingSystem/judgeQueries";
import type { Team } from "@/shared/types/judgingSystem";
import type { FilterSearchParams } from "../types";
import { TEAM_SORTING_OPTIONS } from "@/constants/judgingSystemConstants";
import Table from "@/shared/components/table/Table";
import CardView from "@/shared/components/table/CardView";
import { FaCertificate, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaFilter } from "react-icons/fa6";
import FilterModal from "./FiltersModal";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const CertificatesTab = () => {
  const { eventId } = useParams();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [debouncedTeamName, setDebouncedTeamName] = useState<string>("");
  const [debouncedTeamCode, setDebouncedTeamCode] = useState<string>("");
  const [debouncedDepartmentKey, setDebouncedDepartmentKey] =
    useState<string>("");
  const [debouncedCourseKey, setDebouncedCourseKey] = useState<string>("");
  const [debouncedStatusKey, setDebouncedStatusKey] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("");

  const [loadingTeamId, setLoadingTeamId] = useState<string | null>(null);
  const updateTeamStatusMutation = useUpdateTeamStatus();
  const queryClient = useQueryClient();

  const searchParams: FilterSearchParams = {
    nameKey: debouncedTeamName,
    setNameKey: setDebouncedTeamName,
    codeKey: debouncedTeamCode,
    setCodeKey: setDebouncedTeamCode,
    departmentKey: debouncedDepartmentKey,
    setDepartmentKey: setDebouncedDepartmentKey,
    courseKey: debouncedCourseKey,
    setCourseKey: setDebouncedCourseKey,
    statusKey: debouncedStatusKey,
    setStatusKey: setDebouncedStatusKey,
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedTeamName,
    debouncedTeamCode,
    debouncedDepartmentKey,
    debouncedCourseKey,
    debouncedStatusKey,
  ]);

  const {
    data: teams,
    isLoading,
    isError,
  } = useResearchTeams(
    eventId!,
    currentPage,
    20,
    sortOption,
    debouncedTeamName,
    debouncedTeamCode,
    debouncedCourseKey,
    debouncedDepartmentKey,
    debouncedStatusKey,
    "admin",
  );

  const finishedTeams =
    teams?.teams?.filter((team: Team) =>
      debouncedStatusKey
        ? team.status === debouncedStatusKey
        : team.status === "Evaluated" || team.status === "Certified",
    ) || [];

  const handleRollCertificate = async (team: Team) => {
    const newStatus = team.status === "Evaluated" ? "Certified" : "Evaluated";
    const actionText = team.status === "Evaluated" ? "roll" : "cancel";
    setLoadingTeamId(team.id);
    updateTeamStatusMutation.mutate(
      { teamId: team.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            `Certificate ${actionText === "roll" ? "rolled" : "cancelled"} successfully.`,
          );
          // Update the cache for getTeams and unassignedTeams
          queryClient.invalidateQueries({
            queryKey: ["judgingSystem", "unassignedTeams"],
          });
          queryClient.invalidateQueries({
            queryKey: ["judgingSystem", "getTeams"],
          });
          queryClient.invalidateQueries({ queryKey: ["judgingSystem"] });
        },
        onError: () => {
          toast.error(`Failed to ${actionText} certificate. Please try again.`);
        },
        onSettled: () => {
          setLoadingTeamId(null);
        },
      },
    );
  };

  return (
    <div className="bg-surface-glass-bg rounded-lg shadow-sm border border-surface-glass-border/10 overflow-hidden">
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        searchParams={searchParams}
      />
      <div className="p-4 border-b border-surface-glass-border/10 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-md md:text-lg lg:text-xl font-bold text-text-muted-foreground">
            Certificates{" "}
            {teams ? `(${teams.total})` : ""}
          </p>
          <div className="flex gap-2 items-center justify-center">
            <FaChevronLeft
              className={`cursor-pointer size-4 ${
                !(teams && teams.hasPreviousPage)
                  ? "text-text-muted-foreground/50 cursor-not-allowed"
                  : "text-text-body-main hover:text-primary"
              }`}
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                }
              }}
            />
            <span className="text-[14px] md:text-[15px] lg:text-[16px] font-medium text-text-body-main">
              Page {currentPage}
            </span>
            <FaChevronRight
              className={`cursor-pointer size-4 ${
                !(teams && teams.hasNextPage)
                  ? "text-text-muted-foreground/50 cursor-not-allowed"
                  : "text-text-body-main hover:text-primary"
              }`}
              onClick={() => {
                if (teams && teams.hasNextPage) {
                  setCurrentPage(currentPage + 1);
                }
              }}
            />
          </div>
        </div>
        <hr className="border-surface-glass-border/10" />
        <p className="text-[14px] md:text-[15px] lg:text-[16px] font-semibold text-text-body-main">
          Filters
        </p>
        <div className="flex gap-2 md:flex-row flex-col justify-between">
          <div
            className="md:min-w-76 flex flex-row-reverse justify-between items-center gap-2 cursor-pointer border rounded-full px-3.5 py-1.5 hover:bg-muted-primary/10 transition-colors"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <FaFilter className="size-3 text-secondary mt-0.5" />
            <p className="text-[12px] md:text-[13px] lg:text-[14px] font-semibold text-center">
              Open Filters
            </p>
            <div />
          </div>
          <div className="flex-grow md:max-w-98 flex items-center gap-2">
            <DropdownMenu
              options={TEAM_SORTING_OPTIONS}
              value={sortOption}
              onChange={(val) => setSortOption(val)}
              placeholder="Sort By"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-text-body-main">Loading teams...</p>
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-text-body-main">
            Error loading teams. Please try again.
          </p>
        </div>
      ) : (
        <>
          <Table
            items={finishedTeams}
            columns={[
              { key: "name", label: "Team Name", width: "w-1/3" },
              { key: "code", label: "Team Code", width: "w-1/4" },
              { key: "department", label: "Department", width: "w-1/4" },
              { key: "totalScore", label: "Total Score", width: "w-1/6" },
              { key: "finalScore", label: "Final Score", width: "w-1/6" },
            ]}
            renderActions={(item) => (
              <Button
                type={item.status === "Certified" ? "secondary" : "primary"}
                buttonText={
                  item.status === "Certified"
                    ? "Cancel Certificate"
                    : "Roll Certificate"
                }
                buttonIcon={<FaCertificate />}
                onClick={() => handleRollCertificate(item)}
                width="fit"
                loading={loadingTeamId === item.id}
                disabled={loadingTeamId === item.id}
              />
            )}
            emptyMessage="No evaluated or certified teams found."
          />

          <CardView
            items={finishedTeams}
            titleKey="name"
            renderButtons={(item) => (
              <Button
                type={item.status === "Certified" ? "secondary" : "primary"}
                buttonText={
                  item.status === "Certified"
                    ? "Cancel Certificate"
                    : "Roll Certificate"
                }
                buttonIcon={<FaCertificate />}
                onClick={() => handleRollCertificate(item)}
                width="fit"
                loading={loadingTeamId === item.id}
                disabled={loadingTeamId === item.id}
              />
            )}
            renderedFields={[
              { key: "code", label: "Team Code" },
              { key: "department", label: "Department" },
              { key: "totalScore", label: "Total Score" },
              { key: "finalScore", label: "Final Score" },
            ]}
            emptyMessage="No evaluated or certified teams found."
          />
        </>
      )}
    </div>
  );
};

export default CertificatesTab;
