import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { systemApi } from "@/shared/queries/axiosInstance";

interface AuthState {
  user: {
    roles: string[];
  } | null;
}

interface RootState {
  auth: AuthState;
}

const MemberRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await systemApi.get("/v1/Auth/verify");

        if (response.status !== 200) {
          window.location.replace("/login");
        }
      } catch {
        window.location.replace("/login");
      }
    };
    verifyToken();
  }, []);

  if (!user || user == null) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.some((role) => user.roles.includes(role))) {
    if(user.roles.includes("Judge"))
      return <Navigate to="/judging-system/events" replace />;
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

export default MemberRoute;
