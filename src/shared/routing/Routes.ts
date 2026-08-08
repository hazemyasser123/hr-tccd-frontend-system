import { DashboardPage, LoginPage, EventDetails, PastEventsPage, FormView, FormSubmissionPage, UnauthorizedPage, EvaluationAnalysisPage, AdminJudgePage, FormBuilder, FormEditor, TeamEvaluationPage, JudgingSystemHomePage, EventSelectionPage, EvaluationDetailsPage, AssignedTeamsPage, UsersManagementPage } from "@/features";

const routes: { path: string; Component: React.FC; protected?: boolean; roles?: string[] }[] = [
  { path: "/", Component: DashboardPage, protected: true, roles: ["HR", "Head", "HighBoard", "Admin", "Vest", "Catering"] },
  { path: "/login", Component: LoginPage },
  { path: "/events/:id", Component: EventDetails, protected: true, roles: ["HR", "Head", "HighBoard", "Admin", "Vest", "Catering"] },
  { path: "/events", Component: PastEventsPage, protected: true, roles: ["HR", "Head", "HighBoard", "Admin", "Vest", "Catering"] },
  { path: "/form/:formId", Component: FormView },
  { path: "/form/finish", Component: FormSubmissionPage },
  { path: "/unauthorized", Component: UnauthorizedPage },
  { path: "/form-builder", Component: FormBuilder, protected: true, roles: ["HR", "Head", "HighBoard", "Admin"] },
  { path: "/form-builder/:formId", Component: FormEditor, protected: true, roles: ["HR", "Head", "HighBoard", "Admin"] },
  { path: "form-builder/preview", Component: FormView },
  { path: "/judging-system/teams/:eventId", Component: JudgingSystemHomePage, protected: true, roles: ["Admin", "Judge"] },
  { path: "/judging-system/assess-team/:eventId/:teamId", Component: TeamEvaluationPage, protected: true, roles: ["Admin", "Judge"] },
  { path: "/judging-system/events", Component: EventSelectionPage, protected: true, roles: ["Admin", "Judge"] },
  { path: "/judging-system/team/:teamId", Component: EvaluationDetailsPage, protected: true, roles: ["Admin"] },
  { path: "/judging-system/assigned-teams/:judgeId/:eventId", Component: AssignedTeamsPage, protected: true, roles: ["Admin"] },
  { path: "/judging-system/evaluations/:judgeId/:eventId", Component: AdminJudgePage, protected: true, roles: ["Admin"] },
  { path: "/judging-system/evaluation-analysis/:eventId", Component: EvaluationAnalysisPage, protected: true, roles: ["Admin"] },
  { path: "/users", Component: UsersManagementPage, protected: true, roles: ["Admin"] },
];

export default routes;
