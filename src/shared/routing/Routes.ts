import {
  DashboardPage,
  LoginPage,
  EventDetails,
  EventsPage,
  FormView,
  FormSubmissionPage,
  UnauthorizedPage,
  EvaluationAnalysisPage,
  AdminJudgePage,
  FormBuilder,
  FormEditor,
  TeamEvaluationPage,
  JudgingSystemHomePage,
  EventSelectionPage,
  EvaluationDetailsPage,
  AssignedTeamsPage,
  UsersManagementPage,
  QRCodePage,
  LandingPage,
  PrivacyPolicyPage,
  TermsOfUsePage,
} from "@/features";
import { ADMIN_LIKE_ROLES, STAFF_ROLES } from "@/shared/utils/access";
import type { AppRole, Committee } from "@/shared/types/user";

export interface RouteDefinition {
  path: string;
  Component: React.FC;
  protected?: boolean;
  roles?: AppRole[];
  committees?: Committee[];
}

const HIGH_BOARD: Committee[] = ["HighBoard"];
const HR_COMMITTEE: Committee[] = ["HumanResources"];

const routes: RouteDefinition[] = [
  { path: "/", Component: LandingPage },
  { path: "/login", Component: LoginPage },
  {
    path: "/home",
    Component: DashboardPage,
    protected: true,
    roles: STAFF_ROLES,
    committees: [...HR_COMMITTEE, ...HIGH_BOARD],
  },
  {
    path: "/events",
    Component: EventsPage,
    protected: true,
    roles: STAFF_ROLES,
    committees: HIGH_BOARD,
  },
  {
    path: "/events/:id",
    Component: EventDetails,
    protected: true,
    roles: STAFF_ROLES,
    committees: HIGH_BOARD,
  },
  { path: "/form/:formId", Component: FormView },
  { path: "/form/finish", Component: FormSubmissionPage },
  { path: "/unauthorized", Component: UnauthorizedPage },
  // Form builder: admin-like + HighBoard. (HR committee REMOVED.)
  {
    path: "/form-builder",
    Component: FormBuilder,
    protected: true,
    roles: ADMIN_LIKE_ROLES,
    committees: HIGH_BOARD,
  },
  {
    path: "/form-builder/:formId",
    Component: FormEditor,
    protected: true,
    roles: ADMIN_LIKE_ROLES,
    committees: HIGH_BOARD,
  },
  { path: "form-builder/preview", Component: FormView },
  {
    path: "/judging-system/teams/:eventId",
    Component: JudgingSystemHomePage,
    protected: true,
    roles: [...ADMIN_LIKE_ROLES, "Judge"],
  },
  {
    path: "/judging-system/assess-team/:eventId/:teamId",
    Component: TeamEvaluationPage,
    protected: true,
    roles: [...ADMIN_LIKE_ROLES, "Judge"],
  },
  {
    path: "/judging-system/events",
    Component: EventSelectionPage,
    protected: true,
    roles: [...ADMIN_LIKE_ROLES, "Judge"],
  },
  {
    path: "/judging-system/team/:teamId",
    Component: EvaluationDetailsPage,
    protected: true,
    roles: ADMIN_LIKE_ROLES,
  },
  {
    path: "/judging-system/assigned-teams/:judgeId/:eventId",
    Component: AssignedTeamsPage,
    protected: true,
    roles: ADMIN_LIKE_ROLES,
  },
  {
    path: "/judging-system/evaluations/:judgeId/:eventId",
    Component: AdminJudgePage,
    protected: true,
    roles: ADMIN_LIKE_ROLES,
  },
  {
    path: "/judging-system/evaluation-analysis/:eventId",
    Component: EvaluationAnalysisPage,
    protected: true,
    roles: ADMIN_LIKE_ROLES,
  },
  {
    path: "/users",
    Component: UsersManagementPage,
    protected: true,
    roles: ADMIN_LIKE_ROLES,
  },
  { path: "/qr-code", Component: QRCodePage, protected: true },
  { path: "/privacy-policy", Component: PrivacyPolicyPage },
  { path: "/terms-of-use", Component: TermsOfUsePage },
];

export default routes;
