import { useParams } from "react-router-dom";
import WithNavbar from "@/shared/components/hoc/WithNavbar";
import {
  useGetAllTeamEvaluations,
  useGetTeam,
  useGetTeamAttendancesByJudge,
} from "@/shared/queries/judgingSystem/judgeQueries";
import { LoadingPage, ErrorScreen } from "tccd-ui";
import {
  FaChevronLeft,
  FaUsers,
  FaChartBar,
  FaTrophy,
  FaClipboardList,
  FaUserCheck,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import type { TeamMemberAttendance } from "@/shared/types/judgingSystem";
import DEPARTMENT_LIST from "@/constants/departments";

export default function EvaluationDetailsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [attendanceData, setAttendanceData] = useState<
    Record<string, TeamMemberAttendance[]>
  >({});

  const {
    data: evaluations,
    isLoading: isEvaluationsLoading,
    isError: isEvaluationsError,
  } = useGetAllTeamEvaluations(teamId!);

  const {
    data: teamData,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useGetTeam(teamId!);

  const attendanceByJudgeMutation = useGetTeamAttendancesByJudge();

  useEffect(() => {
    const fetchAttendances = async () => {
      if (!evaluations || !teamId) return;

      const attendanceMap: Record<string, TeamMemberAttendance[]> = {};

      for (const evaluation of evaluations) {
        if (evaluation.judgeId) {
          try {
            const attendance = await attendanceByJudgeMutation.mutateAsync({
              judgeId: evaluation.judgeId,
              teamId: teamId,
            });
            attendanceMap[evaluation.judgeId] = attendance;
          } catch {
            attendanceMap[evaluation.judgeId] = [];
          }
        }
      }

      setAttendanceData(attendanceMap);
    };

    fetchAttendances();
  }, [evaluations, teamId]);

  if (isEvaluationsLoading || isTeamLoading) {
    return <LoadingPage />;
  }

  if (isEvaluationsError || isTeamError || !evaluations || !teamData) {
    return (
      <ErrorScreen
        title="Failed to load evaluation details."
        message="An error has occurred while loading evaluation data, Please try again."
      />
    );
  }

  const averageScore =
    evaluations.length > 0
      ? (
          evaluations.reduce(
            (sum, evaluation) => sum + (evaluation.totalScore || 0),
            0
          ) / evaluations.length
        ).toFixed(2)
      : "0.00";

  const highestScore =
    evaluations.length > 0
      ? Math.max(...evaluations.map((evaluation) => evaluation.totalScore || 0))
      : 0;

  const lowestScore =
    evaluations.length > 0
      ? Math.min(...evaluations.map((evaluation) => evaluation.totalScore || 0))
      : 0;

  const highestEval = evaluations.find(
    (evaluation) => evaluation.totalScore === highestScore
  );
  const lowestEval = evaluations.find(
    (evaluation) => evaluation.totalScore === lowestScore
  );

  return (
    <WithNavbar>
      <div className="xl:w-[56%] lg:w-[68%] md:w-[76%] sm:w-[84%] w-[96%] py-6 px-4 mx-auto rounded-xl shadow-lg mt-6 border-t-[6px] border-primary bg-surface-glass-bg space-y-6 relative text-text-body-main">
        <button
          onClick={() => window.history.back()}
          className="absolute top-6 left-4 flex items-center gap-2 text-text-title hover:text-primary transition-all duration-200 group cursor-pointer"
          aria-label="Go back"
        >
          <FaChevronLeft className="size-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </button>

        <div className="text-center pt-2 pb-2">
          <h1 className="text-[26px] md:text-[30px] lg:text-[34px] font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-2">
            Team Evaluation Board
          </h1>
          <p className="text-sm text-text-muted-foreground">
            Comprehensive evaluation overview and statistics
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <FaUsers className="size-5 text-primary" />
          <p className="text-[17px] md:text-[18px] lg:text-[19px] text-text-muted-foreground font-semibold">
            Team Information
          </p>
        </div>

        <div className="shadow-lg rounded-xl p-4 border border-surface-glass-border/10 bg-surface-glass-bg hover:shadow-xl transition-shadow duration-300">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <div className="font-semibold text-text-muted-foreground text-[12px] md:text-[13px] lg:text-[14px] uppercase tracking-wide">
                Name
              </div>
              <p className="text-[17px] md:text-[19px] lg:text-[21px] text-text-body-main font-medium">
                {teamData.name}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="font-semibold text-text-muted-foreground text-[12px] md:text-[13px] lg:text-[14px] uppercase tracking-wide">
                Course
              </div>
              <p className="text-[17px] md:text-[19px] lg:text-[21px] text-text-body-main font-medium">
                {teamData.course}
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-surface-glass-border/20 to-transparent my-3" />

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="font-semibold text-text-muted-foreground text-[12px] md:text-[13px] lg:text-[14px] uppercase tracking-wide">
                Code
              </div>
              <p className="text-[17px] md:text-[19px] lg:text-[21px] text-text-body-main font-medium">
                {teamData.code}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="font-semibold text-text-muted-foreground text-[12px] md:text-[13px] lg:text-[14px] uppercase tracking-wide">
                Department
              </div>
              <p className="text-[17px] md:text-[19px] lg:text-[21px] text-text-body-main font-medium">
                {DEPARTMENT_LIST.find(
                  (dept) => dept.value === teamData.department
                )?.label || teamData.department}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <FaUsers className="size-5 text-secondary" />
          <p className="text-[17px] md:text-[18px] lg:text-[19px] text-text-muted-foreground font-semibold">
            Team Members
          </p>
        </div>

        <div className="flex-wrap flex shadow-lg gap-2 rounded-xl p-4 border border-surface-glass-border/10 bg-surface-glass-bg hover:shadow-xl transition-shadow duration-300">
          {teamData.teamMembers.map((member) => (
            <span
              key={member.id}
              className="text-[14px] md:text-[15px] lg:text-[16px] text-text-body-main bg-muted-primary/30 px-4 py-1.5 border-primary border rounded-lg hover:bg-muted-primary/40 transition-colors duration-200 font-medium"
            >
              {member.name}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-3">
          <FaChartBar className="size-5 text-secondary" />
          <p className="text-[17px] md:text-[18px] lg:text-[19px] text-text-muted-foreground font-semibold">
            Evaluation Statistics
          </p>
        </div>

        <div className="shadow-lg rounded-xl p-4 border border-surface-glass-border/10 bg-surface-glass-bg hover:shadow-xl transition-shadow duration-300">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="space-y-2">
              <div className="font-semibold text-text-muted-foreground text-[12px] md:text-[13px] lg:text-[14px] uppercase tracking-wide">
                Total evaluations
              </div>
              <p className="text-[28px] md:text-[32px] lg:text-[36px] text-text-body-main font-bold">
                {evaluations.length}
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-text-muted-foreground text-[12px] md:text-[13px] lg:text-[14px] uppercase tracking-wide">
                Average Score
              </div>
              <p className="text-[28px] md:text-[32px] lg:text-[36px] text-primary font-bold">
                {averageScore}
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-surface-glass-border/20 to-transparent my-4" />

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 dark:from-green-950/30 dark:to-emerald-950/30 dark:border-green-800 space-y-2 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2">
                <FaTrophy className="size-4 text-green-600" />
                <p className="text-green-700 text-[12px] md:text-[13px] lg:text-[14px] font-semibold uppercase tracking-wide">
                  Highest Score
                </p>
              </div>
              <p className="text-[24px] md:text-[28px] lg:text-[32px] text-green-900 dark:text-green-100 font-bold">
                {highestScore}
              </p>
              <p className="text-[12px] md:text-[13px] text-green-700 dark:text-green-300">
                By: {highestEval?.judgeName}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800 space-y-2 hover:shadow-md transition-shadow duration-200">
              <p className="text-amber-700 dark:text-amber-300 text-[12px] md:text-[13px] lg:text-[14px] font-semibold uppercase tracking-wide">
                Lowest Score
              </p>
              <p className="text-[24px] md:text-[28px] lg:text-[32px] text-amber-900 dark:text-amber-100 font-bold">
                {lowestScore}
              </p>
              <p className="text-[12px] md:text-[13px] text-amber-700 dark:text-amber-300">
                By: {lowestEval?.judgeName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3">
          <FaClipboardList className="size-5 text-text-muted-foreground" />
          <p className="text-[17px] md:text-[18px] lg:text-[19px] text-text-muted-foreground font-semibold">
            Individual Evaluations
          </p>
        </div>

        {evaluations.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-surface-glass-border/10 bg-surface-glass-border/5">
            <FaClipboardList className="size-12 mx-auto mb-4 text-text-muted-foreground/40" />
            <p className="text-[14px] md:text-[15px] lg:text-[16px] text-text-body-main">
              No evaluations have been submitted for this team yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation, index) => (
              <div
                key={index}
                className="p-4 border-l-4 border-l-secondary border border-gray-200 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-start pb-4 mb-4 border-b border-gray-200">
                  <div className="space-y-1">
                    <p className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-secondary">
                      {evaluation.judgeName}
                    </p>
                    <p className="text-[11px] md:text-[12px] text-inactive-tab-text uppercase tracking-wide">
                      Evaluator
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[26px] md:text-[30px] lg:text-[34px] font-bold text-text-body-main">
                      {evaluation.totalScore}
                    </p>
                    <p className="text-[11px] md:text-[12px] text-text-muted-foreground uppercase tracking-wide">
                      Total Score
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {evaluation.evaluationItemScores
                    .sort((a, b) =>
                      a.evaluationItemId.localeCompare(b.evaluationItemId)
                    )
                    .map((item, itemIndex) => (
                      <div
                        key={item.evaluationItemId}
                        className="p-3 rounded-lg bg-surface-glass-border/5 hover:bg-surface-glass-border/10 transition-colors duration-200 border border-surface-glass-border/10"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <p className="text-[14px] md:text-[15px] lg:text-[16px] text-text-body-main flex items-start gap-2 leading-relaxed">
                              <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 bg-secondary text-white text-xs font-semibold rounded-md shrink-0">
                                Q{itemIndex + 1}
                              </span>
                              <span className="text-pretty">
                                {item.evaluationItemName}
                              </span>
                            </p>
                            <p className="text-text-body-main md:text-[15px] text-[14px] mt-1">
                              {item.evaluationItemDescription}
                            </p>
                          </div>
                          <div className="shrink-0 text-right space-y-0.5">
                            <p className="text-[10px] md:text-[11px] text-text-muted-foreground uppercase tracking-wide">
                              Score
                            </p>
                            <p className="text-[18px] md:text-[20px] lg:text-[22px] font-bold text-primary">
                              {item.score}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-surface-glass-border/10">
                  <h3 className="text-[16px] md:text-[18px] lg:text-[20px] font-semibold text-text-title mb-2">
                    Additional Comments
                  </h3>
                  <p className="text-text-body-main md:text-[15px] text-[14px]">
                    {evaluation.note || "No additional comments provided."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-3">
          <FaUserCheck className="size-5 text-text-muted-foreground" />
          <p className="text-[17px] md:text-[18px] lg:text-[19px] text-text-muted-foreground font-semibold">
            Individual Attendances
          </p>
        </div>

        {evaluations.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-surface-glass-border/10 bg-surface-glass-border/5">
            <FaClipboardList className="size-12 mx-auto mb-4 text-text-muted-foreground/40" />
            <p className="text-[14px] md:text-[15px] lg:text-[16px] text-text-body-main">
              No evaluations have been submitted for this team yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation, index) => (
              <div
                key={index}
                className="p-4 border-l-4 border-l-secondary border border-surface-glass-border/10 rounded-xl bg-surface-glass-bg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-start pb-4 mb-4 border-b border-surface-glass-border/10">
                  <div className="space-y-1">
                    <p className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-secondary">
                      {evaluation.judgeName}
                    </p>
                    <p className="text-[11px] md:text-[12px] text-text-muted-foreground uppercase tracking-wide">
                      Evaluator
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {evaluation.judgeId &&
                  attendanceData[evaluation.judgeId] &&
                  attendanceData[evaluation.judgeId].length > 0 ? (
                    <>
                      {attendanceData[evaluation.judgeId].map(
                        (member: TeamMemberAttendance) => (
                          <div
                            key={member.teamMemberId}
                            className="p-3 rounded-lg bg-surface-glass-border/5 hover:bg-surface-glass-border/10 transition-colors duration-200 border border-surface-glass-border/10"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-1">
                                <p className="text-[14px] md:text-[15px] lg:text-[16px] text-text-body-main flex items-start gap-2 leading-relaxed">
                                  <span className="text-pretty">
                                    {teamData.teamMembers.find(
                                      (tm) => tm.id === member.teamMemberId
                                    )?.name || "Unknown Member"}
                                  </span>
                                </p>
                              </div>
                              <div className="shrink-0 text-right space-y-0.5">
                                <p
                                  className={`text-[14px] md:text-[15px] lg:text-[16px] font-bold ${
                                    member.attended
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {member.attended ? "Present" : "Absent"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </>
                  ) : (
                    <div className="text-[14px] md:text-[15px] lg:text-[16px] text-text-body-main">
                      No attendance data available.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WithNavbar>
  );
}
