import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserApi } from "./userApi";
import { useDispatch } from "react-redux";
import {
  setUser,
  logout as logoutAction,
} from "@/shared/redux/slices/authSlice";
import toast from "react-hot-toast";
import type { member } from "@/shared/types/member";

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
    mutationFn: (credentials: Parameters<typeof userApiInstance.login>[0]) =>
      userApiInstance.login(credentials),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.session() });
      const {
        id = "",
        email = "",
        name = "",
        profileImageUrl = "",
        phoneNumber = "",
        roles = [],
      } = data.data || {};
      dispatch(
        setUser({ id, email, name, profileImageUrl, phoneNumber, roles }),
      );
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
  committee?: string;
  graduationYear?: number;
  position?: string;
}) => {
  return useQuery({
    queryKey: [...userKeys.all, "members", params] as const,
    queryFn: () => userApiInstance.getMembers(params),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({userData, password}: { userData: member; password?: string }) => userApiInstance.createUser(userData, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Member created successfully");
    },
    onError: () => {
      toast.error("Failed to create member");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; userData: member }) =>
      userApiInstance.updateUser(params.userId, params.userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Member updated successfully");
    },
    onError: () => {
      toast.error("Failed to update member");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userApiInstance.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: (userId: string) => userApiInstance.deleteAccount(userId),
    onError: () => {
      toast.error("Failed to delete system account");
    },
  });
};

export const useSendQRCode = () => {
  return useMutation({
    mutationFn: (userId: string) => userApiInstance.sendQRCode(userId)
  });
};
