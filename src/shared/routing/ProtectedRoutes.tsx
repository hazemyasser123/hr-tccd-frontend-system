import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { systemApi } from "@/shared/queries/axiosInstance";
import { persistor } from "@/shared/redux/store/store";
import type { RootState } from "@/shared/redux/store/store";
import type { AppRole, Committee } from "@/shared/types/user";
import {
  isJudge,
  isAttendee,
  isHRCommittee,
} from "@/shared/utils/access";

interface MemberRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  allowedCommittees?: Committee[];
}

const MemberRoute = ({
  children,
  allowedRoles,
  allowedCommittees,
}: MemberRouteProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await systemApi.get("/v1/Auth/verify");
        if (response.status !== 200) {
          window.location.replace("/login");
          await persistor.purge();
        }
      } catch {
        window.location.replace("/login");
        await persistor.purge();
      }
    };
    verifyToken();
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  const hasRole =
    allowedRoles?.some((role) => user.roles.includes(role)) ?? false;
  const hasCommittee =
    user.committee !== undefined &&
    (allowedCommittees?.includes(user.committee) ?? false);
  const authorized =
    !allowedRoles && !allowedCommittees ? true : hasRole || hasCommittee;

  if (!authorized) {
    // Friendly fallbacks to each tier's home.
    if (isJudge(user)) return <Navigate to="/judging-system/events" replace />;
    if (isHRCommittee(user)) return <Navigate to="/home" replace />;
    if (isAttendee(user)) return <Navigate to="/qr-code" replace />;
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

export default MemberRoute;