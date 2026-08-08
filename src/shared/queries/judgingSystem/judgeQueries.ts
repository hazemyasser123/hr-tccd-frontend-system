import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import type {
  EvaluationSubmission,
  Judge,
  JudgeQuestion,
  Team,
  TeamMemberAttendance,
} from "@/shared/types/judgingSystem";
import * as JudgeAPI from "./judgeAPI";
import DEPARTMENT_LIST from "@/constants/departments";

const judgeKeys = {
  all: ["judgingSystem"] as const,
  getTeams: (
    page: number,
    count: number,
    sortBy: string,
    nameKey: string,
    codeKey: string,
    courseKey: string,
    departmentKey: string,
    statusKey: string,
    mode: string,
  ) =>
    [
      ...judgeKeys.all,
      {
        page,
        count,
        sortBy,
        nameKey,
        codeKey,
        courseKey,
        departmentKey,
        statusKey,
        mode,
      },
    ] as const,
  getTeam: (teamId: string) => [...judgeKeys.all, "team", teamId] as const,
  createTeam: () => [...judgeKeys.all] as const,
  updateTeam: () => [...judgeKeys.all] as const,
  deleteTeam: () => [...judgeKeys.all] as const,
  getQuestions: (eventId: string) => [...judgeKeys.all, eventId] as const,
  addQuestion: () => [...judgeKeys.all] as const,
  deleteQuestion: () => [...judgeKeys.all] as const,
  updateQuestion: () => [...judgeKeys.all] as const,
  submitEvaluation: () => [...judgeKeys.all] as const,
  updateEvaluation: () => [...judgeKeys.all] as const,
  getEvaluation: (teamId: string) => [...judgeKeys.all, teamId] as const,
  getAllEvaluations: (teamId: string) =>
    [...judgeKeys.all, "evaluations", teamId] as const,
  resetJudgePassword: () => [...judgeKeys.all, "resetPassword"] as const,
  assignTeamsToJudge: () => [...judgeKeys.all, "assignTeams"] as const,
  removeTeamFromJudge: () => [...judgeKeys.all, "removeTeam"] as const,
  addTeamAttendance: () => [...judgeKeys.all, "addAttendance"] as const,
  getTeamAttendance: (teamId: string) =>
    [...judgeKeys.all, "teamAttendance", teamId] as const,
  updateTeamAttendance: () => [...judgeKeys.all, "updateAttendance"] as const,
  getTeamAttendancesByJudge: (judgeId: string) =>
    [...judgeKeys.all, "teamAttendances", judgeId] as const,
  updateTeamScores: () => [...judgeKeys.all, "updateScores"] as const,
};

export const  useResearchTeams = (
  eventId: string,
  page: number,
  count: number,
  sortBy: string,
  nameKey: string,
  codeKey: string,
  courseKey: string,
  departmentKey: string,
  statusKey: string,
  mode: string,
  enableAutoFetch = true,
): UseQueryResult<{ teams: Team[]; total: number, hasNextPage: boolean, hasPreviousPage: boolean }, Error> => {
  return useQuery({
    queryKey: judgeKeys.getTeams(
      page,
      count,
      sortBy,
      nameKey,
      codeKey,
      courseKey,
      departmentKey,
      statusKey,
      mode,
    ),
    queryFn: async () => {
      const teams = await JudgeAPI.getEventTeams(
        eventId,
        page,
        count,
        sortBy,
        nameKey,
        codeKey,
        courseKey,
        departmentKey,
        statusKey,
        mode,
      );
      const formattedTeams = teams.teams.map((team: Team) => {
        const departmentName =
          DEPARTMENT_LIST.find((dept) => dept.value === team.department)
            ?.label || team.department;
        return { ...team, department: departmentName };
      });

      return { teams: formattedTeams, total: teams.total, hasNextPage: teams.hasNextPage, hasPreviousPage: teams.hasPreviousPage };
    },
    enabled: enableAutoFetch,
  });
};

export const useGetTeam = (teamId: string): UseQueryResult<Team, Error> => {
  return useQuery({
    queryKey: judgeKeys.getTeam(teamId),
    queryFn: async () => {
      const team = await JudgeAPI.getTeam(teamId);
      return team;
    },
  });
};

export const useCreateTeam = () => {
  return useMutation({
    mutationKey: judgeKeys.createTeam(),
    mutationFn: async ({
      eventId,
      teamData,
    }: {
      eventId: string;
      teamData: Team;
    }) => {
      await JudgeAPI.createTeam(eventId, teamData);
    },
  });
};

export const useUpdateTeam = () => {
  return useMutation({
    mutationKey: judgeKeys.updateTeam(),
    mutationFn: async ({
      teamData,
      oldTeamData,
    }: {
      teamData: Team;
      oldTeamData: Team;
    }) => {
      const addedMembers = teamData.teamMembers.filter(
        (tm) => !oldTeamData.teamMembers.some((otm) => otm.id === tm.id),
      );
      const removedMembers = oldTeamData.teamMembers.filter(
        (otm) => !teamData.teamMembers.some((tm) => tm.id === otm.id),
      );

      for (const member of addedMembers) {
        await JudgeAPI.addTeamMember(teamData.id, member.name);
      }
      for (const member of removedMembers) {
        await JudgeAPI.removeTeamMember(member.id);
      }
      for (const member of teamData.teamMembers) {
        const oldMember = oldTeamData.teamMembers.find(
          (otm) => otm.id === member.id,
        );
        if (oldMember && oldMember.name !== member.name) {
          await JudgeAPI.updateTeamMember(member.id, member.name);
        }
      }
      await JudgeAPI.updateTeam(teamData);
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: judgeKeys.deleteTeam(),
    mutationFn: async (teamId: string) => {
      await JudgeAPI.deleteTeam(teamId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: judgeKeys.all });
    },
  });
};

export const useUpdateTeamStatus = () => {
  return useMutation({
    mutationKey: ["judgingSystem", "updateTeamStatus"],
    mutationFn: async (payload: { teamId: string; status: string }) => {
      await JudgeAPI.updateTeamStatus(payload.teamId, payload.status);
    },
  });
};

export const useEventQuestions = (
  eventId: string,
): UseQueryResult<JudgeQuestion[], Error> => {
  return useQuery({
    queryKey: judgeKeys.getQuestions(eventId),
    queryFn: async () => {
      const questions = await JudgeAPI.getEventQuestions(eventId);
      return questions;
    },
  });
};

export const useCreateEventQuestion = () => {
  return useMutation({
    mutationKey: judgeKeys.addQuestion(),
    mutationFn: async (questionData: JudgeQuestion) => {
      await JudgeAPI.createEventQuestion(questionData);
    },
  });
};

export const useDeleteEventQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: judgeKeys.deleteQuestion(),
    mutationFn: async (questionId: string) => {
      await JudgeAPI.deleteEventQuestion(questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: judgeKeys.all });
    },
  });
};

export const useUpdateEventQuestion = () => {
  return useMutation({
    mutationKey: judgeKeys.updateQuestion(),
    mutationFn: async (questionData: JudgeQuestion) => {
      await JudgeAPI.updateEventQuestion(questionData);
    },
  });
};

export const useSubmitTeamEvaluation = () => {
  return useMutation({
    mutationKey: judgeKeys.submitEvaluation(),
    mutationFn: async (payload: EvaluationSubmission) => {
      await JudgeAPI.submitTeamEvaluation(payload);
    },
  });
};

export const useUpdateTeamEvaluation = () => {
  return useMutation({
    mutationKey: judgeKeys.updateEvaluation(),
    mutationFn: async (payload: EvaluationSubmission) => {
      await JudgeAPI.updateTeamEvaluation(payload);
    },
  });
};

export const useGetTeamEvaluation = (teamId: string) => {
  return useQuery({
    queryKey: judgeKeys.getEvaluation(teamId),
    queryFn: async () => {
      try {
        const evaluation = await JudgeAPI.getTeamEvaluation(teamId);
        return evaluation;
      } catch (error: any) {
        if (error.status === 404) {
          return null;
        }
      }
    },
    enabled: !!teamId,
  });
};

export const useGetAllTeamEvaluations = (teamId: string) => {
  return useQuery({
    queryKey: judgeKeys.getAllEvaluations(teamId),
    queryFn: async () => {
      try {
        const evaluations = await JudgeAPI.getAllTeamEvaluations(teamId);
        return evaluations;
      } catch (error: any) {
        if (error.status === 404) {
          return null;
        }
      }
    },
  });
};

export const useFinalizeTeamScores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["judgingSystem", "finalizeTeamScores"],
    mutationFn: async (payload: { eventId: string; department: string; judgeId: string; maxScore: number }) => {
      await JudgeAPI.finalizeTeamScores(payload.eventId, payload.department, payload.judgeId, payload.maxScore);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: judgeKeys.all });
    },
  });
};

export const useGetJudgesForEvent = (
  page: number,
  count: number,
  nameKey: string,
): UseQueryResult<{ total: number; hasNextPage: boolean; hasPreviousPage: boolean; data: Judge[] }, Error> => {
  return useQuery({
    queryKey: ["judgingSystem", "judges", page, count, nameKey],
    queryFn: async () => {
      return await JudgeAPI.getJudgesForEvent(page, count, nameKey);
    },
  });
};

export const useGetAssignedTeamsForJudge = (
  judgeId: string,
  eventId: string,
): UseQueryResult<{judgeName: string, assignedTeams: Team[]}, Error> => {
  return useQuery({
    queryKey: ["judgingSystem", "assignedTeams", judgeId, eventId],
    queryFn: async () => {
      const teams = await JudgeAPI.getAssignedTeamsForJudge(judgeId, eventId);
      return teams;
    },
  });
};

export const useGetUnassignedTeamsForJudge = (
  judgeId: string,
  eventId: string,
  page: number,
  count: number,
  sortBy: string,
  nameKey: string,
  codeKey: string,
  courseKey: string,
  departmentKey: string,
  statusKey: string,
): UseQueryResult<{ teams: Team[]; total: number }, Error> => {
  return useQuery({
    queryKey: [
      "judgingSystem",
      "unassignedTeams",
      judgeId,
      eventId,
      page,
      count,
      sortBy,
      nameKey,
      codeKey,
      courseKey,
      departmentKey,
      statusKey,
    ],
    queryFn: async () => {
      const teams = await JudgeAPI.getUnassignedTeamsForJudge(
        judgeId,
        eventId,
        page,
        count,
        sortBy,
        nameKey,
        codeKey,
        courseKey,
        departmentKey,
        statusKey,
      );
      const formattedTeams = teams.teams.map((team: Team) => {
        const departmentName =
          DEPARTMENT_LIST.find((dept) => dept.value === team.department)
            ?.label || team.department;
        return { ...team, department: departmentName };
      });

      return { teams: formattedTeams, total: teams.total };
    },
  });
};

export const useCreateJudge = () => {
  return useMutation({
    mutationKey: ["judgingSystem", "createJudge"],
    mutationFn: async (judgeData: Judge) => {
      await JudgeAPI.createJudge(judgeData);
    },
  });
};

export const useResetJudgePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["judgingSystem", "resetJudgePassword"],
    mutationFn: async (payload: { judgeId: string; password: string }) => {
      await JudgeAPI.resetJudgePassword(payload.judgeId, payload.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: judgeKeys.all });
    },
  });
};

export const useAssignTeamsToJudge = () => {
  return useMutation({
    mutationKey: ["judgingSystem", "assignTeamsToJudge"],
    mutationFn: async (payload: { judgeId: string; teamIds: string[] }) => {
      await JudgeAPI.assignTeamToJudge(payload.judgeId, payload.teamIds);
    },
  });
};

export const useRemoveTeamFromJudge = () => {
  return useMutation({
    mutationKey: ["judgingSystem", "removeTeamFromJudge"],
    mutationFn: async (payload: { judgeId: string; teamId: string }) => {
      await JudgeAPI.removeTeamFromJudge(payload.judgeId, payload.teamId);
    },
  });
};

export const useAddTeamAttendance = () => {
  return useMutation({
    mutationKey: ["judgingSystem", "addTeamAttendance"],
    mutationFn: async (teamData: TeamMemberAttendance[]) => {
      await JudgeAPI.addTeamAttendance(teamData);
    },
  });
};

export const useGetTeamAttendance = (
  teamId: string,
): UseQueryResult<TeamMemberAttendance[], Error> => {
  return useQuery({
    queryKey: ["judgingSystem", "teamAttendance", teamId],
    queryFn: async () => {
      const attendance = await JudgeAPI.getTeamAttendance(teamId);
      return attendance;
    },
    retry: 1,
  });
};

export const useUpdateTeamAttendance = () => {
  return useMutation({
    mutationKey: ["judgingSystem", "updateTeamAttendance"],
    mutationFn: async (teamMemberData: TeamMemberAttendance) => {
      await JudgeAPI.updateTeamAttendance(teamMemberData);
    },
  });
};

export const useGetTeamAttendancesByJudge = () => {
  return useMutation({
    mutationKey: ["judgingSystem", "teamAttendancesByJudge"],
    mutationFn: async (payload: { judgeId: string; teamId: string }) => {
      const attendance = await JudgeAPI.getTeamAttendancesByJudge(
        payload.judgeId,
        payload.teamId,
      );
      return attendance;
    },
  });
};

export const useExportEvaluationsToExcel = () => {
  return useMutation({
    mutationKey: ["judgingSystem", "exportEvaluationsToExcel"],
    mutationFn: async (eventId: string) => {
      const excelBlob = await JudgeAPI.exportEvaluationsToExcel(eventId);
      return excelBlob;
    },
  });
};

export const useGetJudgeEvaluationProgress = (
  judgeId: string,
  eventId: string,
): UseQueryResult<
  { teamId: string; teamName: string; teamCode: string, isScored: boolean }[],
  Error
> => {
  return useQuery({
    queryKey: ["judgingSystem", "judgeEvaluationProgress", judgeId, eventId],
    queryFn: async () => {
      const progress = await JudgeAPI.getJudgeEvaluationProgress(
        judgeId,
        eventId,
      );
      return progress;
    },
  });
};

export const useGetAssignedJudgesForTeam = () => {
  return useMutation({
    mutationFn: async (teamId: string) => {
      const judges = await JudgeAPI.getJudgesAssignedToTeam(teamId);
      return judges;
    },
  });
};
