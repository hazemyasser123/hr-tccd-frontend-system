import WithNavbar from "@/shared/components/hoc/WithNavbar";
import { useParams } from "react-router-dom";
import { LoadingPage, ErrorScreen, Button } from "tccd-ui";
import { useGetAssignedTeamsForJudge, useGetJudgeEvaluationProgress } from "@/shared/queries/judgingSystem/judgeQueries";
import { useMemo, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { TiChartBar } from "react-icons/ti";
import FinalizeScoresModal from "../components/FinalizeScoresModal";
import DEPARTMENT_LIST from "@/constants/departments";

export default function AdminJudgePage() {
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] =
  useState<boolean>(false);

  const { judgeId, eventId } = useParams();
  const {
    data: teamsData,
    isLoading,
    isError,
  } = useGetAssignedTeamsForJudge(judgeId!, eventId!);

  const {
    data: evaluationProgress,
    isLoading: evaluationProgressIsLoading,
    isError: evaluationProgressIsError,
  } = useGetJudgeEvaluationProgress(judgeId!, eventId!);

  const sortedTeams = useMemo(() => {
    let teams = teamsData?.assignedTeams || [];
    teams = teams
      ? [...teams].sort((a, b) => {
          if (a.code && b.code) {
            return a.code.localeCompare(b.code);
          } else if (a.code) {
            return -1;
          } else if (b.code) {
            return 1;
          } else {
            return 0;
          }
        })
      : [];

    teams = teams.map((team) => {
      const evaluation = evaluationProgress?.find((e) => e.teamId === team.id);
      return {
        ...team,
        evaluated: evaluation?.isScored || false,
      };
    });

    return teams;
  }, [teamsData?.assignedTeams, evaluationProgress]);

    
  const department = useMemo(() => {
    return DEPARTMENT_LIST.find((dept) => dept.value === sortedTeams?.[0]?.department)?.value
  }, [sortedTeams]);
  
  if (isLoading || evaluationProgressIsLoading) {
    return <LoadingPage />;
  }

  if (isError || evaluationProgressIsError) {
    return (
      <ErrorScreen
        message="Failed to load judge data, please try again later."
        title="Failed to fetch data"
      />
    );
  }

  return (
    <WithNavbar>
      <FinalizeScoresModal
        department={department || ""}
        judgeId={judgeId || ""}
        isOpen={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
      />
      <div className="w-[96%] md:w-[94%] lg:w-[84%] xl:w-[73%] mx-auto mt-6">
        <div className="flex gap-2 items-center cursor-pointer group" onClick={() => window.history.back()}>
          <FaChevronLeft
            className="size-4 cursor-pointer text-text-body-main group-hover:text-primary transition-colors duration-150"
          />
          <p className="text-md md:text-lg font-bold text-text-title group-hover:text-primary transition-colors duration-150">
            Back
          </p>
        </div>
      </div>
      <div className="bg-surface-glass-bg shadow-lg rounded-lg border-surface-glass-border/10 p-4 w-[96%] md:w-[94%] lg:w-[84%] xl:w-[73%] mx-auto border mt-3">
        <p className="text-center text-[22px] md:text-[24px] lg:text-[26px] font-bold text-text-title">
          {teamsData?.judgeName}'s Evaluations
        </p>
        <p className="text-center mb-4 md:mb-6 lg:text-[16px] md:text-[15px] text-[14px] text-text-muted-foreground">
          A detailed listing of all of the judge's evaluations
        </p>
        <div className="space-y-4">
          {sortedTeams.length === 0 ? (
            <p className="text-center text-[15px] md:text-[16px] lg:text-[17px] text-text-muted-foreground">
              No teams assigned to this judge yet.
            </p>
          ) : (
            <div className="relative space-y-3 flex flex-col items-end">
              <Button
                type="secondary"
                buttonText="Finalize Scores"
                buttonIcon={<TiChartBar size={18} />}
                onClick={() => setIsFinalizeModalOpen(true)}
                width="fit"
              />
              {sortedTeams.map((team) => (
                <div
                  key={team.id}
                  className="w-full border border-surface-glass-border/10 rounded-xl p-3 px-5"
                >
                  <div className="flex justify-between items-center">
                    <p className="w-[30%] text-sm md:text-[16px] font-semibold text-text-body-main">
                      {team.name}
                    </p>
                    <p className="w-[30%] text-sm md:text-[16px] font-semibold text-text-body-main">
                      {team.code || "N/A"}
                    </p>
                    <p className="w-[10%] text-sm md:text-[15px] font-medium">
                      {
                        team.totalScore || "N/A"
                      }
                    </p>
                    <p className="w-[10%] text-sm md:text-[15px] font-medium">
                      {
                        team.finalScore || "N/A"
                      }
                    </p>
                    <p
                      className={`w-[20%] text-end text-sm md:text-[15px] font-medium ${
                        team.evaluated ? "text-green-500" : "text-primary"
                      }`}
                    >
                      {team.evaluated ? "Evaluated" : "Not evaluated"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WithNavbar>
  );
}
