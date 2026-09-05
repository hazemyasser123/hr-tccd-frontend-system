import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { UserApi } from "./userApi";
import { useDispatch } from "react-redux";
import {
  setUser,
  logout as logoutAction,
} from "@/shared/redux/slices/authSlice";
import toast from "react-hot-toast";
import type { User, Committee, Position } from "@/shared/types/user";

export const userKeys = {
  all: ["user"] as const,
  session: () => [...userKeys.all, "session"] as const,
  login: () => [...userKeys.all, "login"] as const,
  logout: () => [...userKeys.all, "logout"] as const,
  getHRUsers: (nameKey: string, page: number, count: number) =>
    [...userKeys.all, "HR", { nameKey, page, count }] as const,
};

const userApiInstance = new UserApi();

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (credentials: Partial<User>) => {
      const loginResponse = await userApiInstance.login(credentials);
      let partial: Partial<User> = (loginResponse?.data ?? {}) as Partial<User>;
      try {
        const sessionResponse = await userApiInstance.session();
        partial = (sessionResponse?.data ?? partial) as Partial<User>;
      } catch {
        // fall back to whatever the login call returned
      }
      const normalized: User = {
        id: partial.id ?? "",
        email: partial.email ?? "",
        name: partial.name ?? "",
        profileImageUrl: partial.profileImageUrl ?? "",
        phoneNumber: partial.phoneNumber,
        committee: partial.committee,
        roles: partial.roles ?? [],
      };
      return normalized;
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.session() });
      dispatch(setUser(user));
      toast.success("Login successful! Welcome back!");
    },
    onError: () => {
      toast.error("Login failed. Please try again.");
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const mutation = useMutation({
    mutationFn: () => userApiInstance.logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: userKeys.session() });
      dispatch(logoutAction());
    },
    onError: () => {
      toast.error("Logout failed. Please try again.");
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
};

export const useSession = () => {
  return useQuery({
    queryKey: userKeys.session(),
    queryFn: () => userApiInstance.session(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetHRUsers = (nameKey: string, page: number, count: number) => {
  return useQuery({
    queryKey: userKeys.getHRUsers(nameKey, page, count),
    queryFn: () => userApiInstance.getHRUsers(nameKey, page, count),
  });
};

export const useGetMembers = (params: {
  page: number;
  count: number;
  name?: string;
  committee?: Committee;
  graduationYear?: number;
  position?: Position;
  sortBy?: string;
}) => {
  return useQuery({
    queryKey: [...userKeys.all, "members", params] as const,
    queryFn: () => userApiInstance.getMembers(params),
    placeholderData: keepPreviousData,
  });
};

export const useGetQRCode = (userId: string) => {
  return useQuery({
    queryKey: [...userKeys.all, "qrCode", userId] as const,
    queryFn: () => userApiInstance.getQRCode(userId),
    enabled: !!userId,
  });
};
