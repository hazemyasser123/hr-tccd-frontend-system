import { systemApi } from "../axiosInstance";
import type {
  JudgeQuestion,
  Team,
  EvaluationSubmission,
  EvaluationItem,
  Judge,
  TeamMemberAttendance,
} from "@/shared/types/judgingSystem";

const JUDGING_API_URL = "/v1";

export async function getEventTeams(
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
): Promise<any> {
  let SortBy: string | undefined = undefined;
  let Order: string | undefined = undefined;

  if (sortBy) {
    if (sortBy === "nameAsc" || sortBy === "nameDesc") {
      SortBy = "Name";
      Order = sortBy === "nameAsc" ? "Asc" : "Desc";
    } else {
      SortBy = "Score";
      Order = sortBy === "scoreAsc" ? "Asc" : "Desc";
    }
  }

  const params: Record<string, any> = {};

  if (SortBy) params.OrderBy = SortBy;
  if (Order) params.SortingDirection = Order;
  if (nameKey) params.Name = nameKey;
  if (codeKey) params.Code = codeKey;
  if (courseKey) params.Course = courseKey;
  if (departmentKey) params.Department = departmentKey;
  if (statusKey) params.Status = statusKey;

  if (mode === "admin") {
    params.page = page;
    params.count = count;
    
    const response = await systemApi.get(
      `${JUDGING_API_URL}/Team/event/${eventId}`,
      { params },
    );
    return { total: response.data.data.total, teams: response.data.data.data, hasNextPage: response.data.data.hasNextPage, hasPreviousPage: response.data.data.hasPreviousPage };
  } else {
    params.pageNumber = page;
    params.pageSize = count;
    params.EventId = eventId;
    
    const response = await systemApi.get(`${JUDGING_API_URL}/Judge/teams`, {
      params,
    });
    return {
      total: response.data.data.teams.length,
      teams: response.data.data.teams,
      hasNextPage: response.data.data.hasNextPage,
      hasPreviousPage: response.data.data.hasPreviousPage,
    };
  }
}

export async function getTeam(teamId: string): Promise<Team> {
  const response = await systemApi.get(`${JUDGING_API_URL}/Team/${teamId}`);
  return response.data.data;
}

export async function createTeam(eventId: string, teamData: Team) {
  const teamPayload = {
    ...teamData,
    teamMembers: teamData.teamMembers.map((member) => ({ name: member.name })),
  };

  await systemApi.post(`${JUDGING_API_URL}/Team/${eventId}`, teamPayload);
}

export async function updateTeam(teamData: Team) {
  await systemApi.patch(`${JUDGING_API_URL}/Team/${teamData.id}`, teamData);
}

export async function addTeamMember(
  teamId: string,
  memberName: string,
): Promise<void> {
  await systemApi.post(`${JUDGING_API_URL}/TeamMember/${teamId}`, {
    name: memberName,
  });
}

export async function removeTeamMember(memberId: string): Promise<void> {
  await systemApi.delete(`${JUDGING_API_URL}/TeamMember/${memberId}`);
}

export async function updateTeamMember(
  memberId: string,
  memberName: string,
): Promise<void> {
  await systemApi.patch(`${JUDGING_API_URL}/TeamMember/${memberId}`, {
    name: memberName,
  });
}

export async function deleteTeam(teamId: string): Promise<void> {
  await systemApi.delete(`${JUDGING_API_URL}/Team/${teamId}`);
}

export async function updateTeamStatus(
  teamId: string,
  status: string,
): Promise<void> {
  await systemApi.patch(`${JUDGING_API_URL}/Team/${teamId}/status`, {
    status,
  });
}

export async function getEventQuestions(
  eventId: string,
): Promise<JudgeQuestion[]> {
  const response = await systemApi.get(
    `${JUDGING_API_URL}/Evaluation/event/${eventId}/items`,
  );
  return response.data.data.sort(
    (a: JudgeQuestion, b: JudgeQuestion) => a.itemNumber - b.itemNumber,
  );
}

export async function createEventQuestion(
  questionData: JudgeQuestion,
): Promise<void> {
  await systemApi.post(`${JUDGING_API_URL}/Evaluation/item`, questionData);
}

export async function deleteEventQuestion(questionId: string): Promise<void> {
  await systemApi.delete(`${JUDGING_API_URL}/Evaluation/item/${questionId}`);
}

export async function updateEventQuestion(
  questionData: JudgeQuestion,
): Promise<void> {
  await systemApi.put(
    `${JUDGING_API_URL}/Evaluation/item/${questionData.id}`,
    questionData,
  );
}

export async function submitTeamEvaluation(
  payload: EvaluationSubmission,
): Promise<void> {
  await systemApi.post(`${JUDGING_API_URL}/Evaluation/evaluate`, payload);
}

export async function updateTeamEvaluation(
  payload: EvaluationSubmission,
): Promise<void> {
  await systemApi.put(`${JUDGING_API_URL}/Evaluation/evaluate`, payload);
}

export async function getTeamEvaluation(
  teamId: string,
): Promise<EvaluationSubmission | null> {
  const response = await systemApi.get(
    `${JUDGING_API_URL}/Evaluation/team/${teamId}/judge`,
  );
  const data = response.data.data.evaluationItemScores.map(
    (item: EvaluationItem) => ({
      evaluationItemId: item.evaluationItemId,
      score: item.score,
    }),
  );

  return {
    teamId: response.data.data.teamId,
    judgeId: response.data.data.judgeId,
    judgeName: response.data.data.judgeName,
    totalScore: response.data.data.totalScore,
    evaluationItemScores: data,
    note: response.data.data.note,
  };
}

export async function getAllTeamEvaluations(
  teamId: string,
): Promise<EvaluationSubmission[]> {
  const response = await systemApi.get(
    `${JUDGING_API_URL}/Evaluation/team/${teamId}`,
  );
  return response.data.data;
}

export async function finalizeTeamScores(
  eventId: string,
  department: string,
  judgeId: string,
  maxScore: number,
): Promise<void> {
  await systemApi.post(`${JUDGING_API_URL}/Evaluation/normalize`, {
    eventId,
    department,
    judgeId,
    maxScore,
  });
}

export async function getJudgesForEvent(
  pagNumber: number,
  pageSize: number,
  nameKey: string,
): Promise<{total: number, hasNextPage: boolean, hasPreviousPage: boolean, data: Judge[]}> {
  const params: Record<string, any> = {
    PageNumber: pagNumber,
    PageSize: pageSize,
  };

  if (nameKey) params.Name = nameKey;
  const response = await systemApi.get(`${JUDGING_API_URL}/Admin/judges`, {
    params,
  });
  return response.data.data;
}

export async function createJudge(judgeData: Judge): Promise<void> {
  await systemApi.post(`${JUDGING_API_URL}/Judge`, judgeData);
}

export async function deleteJudge(judgeId: string): Promise<void> {
  await systemApi.delete(`${JUDGING_API_URL}/Judge/${judgeId}`);
}

export async function resetJudgePassword (judgeId: string, password: string): Promise<void> {
  await systemApi.patch(`${JUDGING_API_URL}/Admin/Users/${judgeId}/password`, {password: password});
}

export async function getAssignedTeamsForJudge(
  judgeId: string,
  eventId: string,
): Promise<{judgeName: string, assignedTeams: Team[]}> {
  const response = await systemApi.get(
    `${JUDGING_API_URL}/Admin/judges/${judgeId}/teams`,
    { params: { eventId } },
  );
  return {judgeName: response.data.data.judgeName, assignedTeams: response.data.data.assignedTeams};
}

export async function getUnassignedTeamsForJudge(
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
): Promise<any> {
  let SortBy: string | undefined = undefined;
  let Order: string | undefined = undefined;

  if (sortBy) {
    if (sortBy === "nameAsc" || sortBy === "nameDesc") {
      SortBy = "Name";
      Order = sortBy === "nameAsc" ? "Asc" : "Desc";
    } else {
      SortBy = "Score";
      Order = sortBy === "scoreAsc" ? "Asc" : "Desc";
    }
  }

  const params: Record<string, any> = {
    pageNumber: page,
    pageSize: count,
    eventId,
  };

  if (SortBy) params.OrderBy = SortBy;
  if (Order) params.SortingDirection = Order;
  if (nameKey) params.Name = nameKey;
  if (codeKey) params.Code = codeKey;
  if (courseKey) params.Course = courseKey;
  if (departmentKey) params.Department = departmentKey;
  if (statusKey) params.Status = statusKey;

  const response = await systemApi.get(
    `${JUDGING_API_URL}/Admin/judges/${judgeId}/events/${eventId}/teams/unassigned`,
    { params },
  );
  return { total: response.data.data.total, teams: response.data.data.data };
}

export async function assignTeamToJudge(
  judgeId: string,
  teamIds: string[],
): Promise<void> {
  await systemApi.post(`${JUDGING_API_URL}/Judge/${judgeId}/teams`, {
    teamIds,
  });
}

export async function removeTeamFromJudge(
  judgeId: string,
  teamId: string,
): Promise<void> {
  await systemApi.delete(`${JUDGING_API_URL}/Judge/${judgeId}/teams/${teamId}`);
}

export async function addTeamAttendance(
  teamData: TeamMemberAttendance[],
): Promise<void> {
  await systemApi.post(
    `${JUDGING_API_URL}/ResearchDayAttendance/bulk`,
    teamData,
  );
}

export async function getTeamAttendance(
  teamId: string,
): Promise<TeamMemberAttendance[]> {
  const response = await systemApi.get(
    `${JUDGING_API_URL}/ResearchDayAttendance/judges/teams/${teamId}`,
  );
  return response.data.data.attendance.map((attendance: any) => ({
    attended: attendance.attended,
    teamMemberId: attendance.teamMember.id,
  }));
}

export async function updateTeamAttendance(
  teamMemberData: TeamMemberAttendance,
): Promise<void> {
  await systemApi.put(
    `${JUDGING_API_URL}/ResearchDayAttendance`,
    teamMemberData,
  );
}

export async function getTeamAttendancesByJudge(
  judgeId: string,
  teamId: string,
): Promise<TeamMemberAttendance[]> {
  const response = await systemApi.get(
    `${JUDGING_API_URL}/Admin/research-attendance/judges/${judgeId}/teams/${teamId}`,
  );
  return response.data.data.attendance.map((attendance: any) => ({
    attended: attendance.attended,
    teamMemberId: attendance.teamMember.id,
  }));
}

export async function exportEvaluationsToExcel(eventId: string): Promise<Blob> {
  const response = await systemApi.get(
    `${JUDGING_API_URL}/Evaluation/event/${eventId}/export`,
    {
      responseType: "blob",
    },
  );
  return response.data;
}

export async function getJudgeEvaluationProgress(
  judgeId: string,
  eventId: string,
): Promise<{ teamId: string; teamName: string; teamCode: string; isScored: boolean }[]> {
  const response = await systemApi.get(
    `${JUDGING_API_URL}/Admin/research-attendance/judges/${judgeId}/events/${eventId}/teams/status`,
  );
  return response.data.data;
}

export async function getJudgesAssignedToTeam(
  teamId: string,
): Promise<Judge[]> {
  const response = await systemApi.get(
    `${JUDGING_API_URL}/Admin/teams/${teamId}/judges`,
  );
  return response.data.data.assignedJudges;
}
