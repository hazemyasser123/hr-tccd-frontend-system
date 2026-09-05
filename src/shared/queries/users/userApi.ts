import { systemApi } from "../axiosInstance";
import type { User, Committee, Position } from "@/shared/types/user";

const LOGIN_ROUTE = "/v1/Auth/"; // <-- NO /api prefix here
const USER_API_URL = "/users/"; // <-- NO /api prefix here

export class UserApi {
  async login(credentials: Partial<User>) {
    const { data } = await systemApi.post(LOGIN_ROUTE + "login", credentials);
    return data;
  }

  async logout() {
    const { data } = await systemApi.post(LOGIN_ROUTE + "logout");
    return data;
  }

  async session() {
    const { data } = await systemApi.get(USER_API_URL + "session");
    return data;
  }

  async getMemberDetails(userId: string) {
    const { data } = await systemApi.get(`/v1/Members/${userId}`);
    return data.data; // Access the nested data property
  }

  async getHRUsers(nameKey: string, page: number, count: number) {
    const params: Record<string, string | number> = {
      PageNumber: page,
      PageSize: count,
    };

    if (nameKey) {
      params.Name = nameKey;
    }

    const { data } = await systemApi.get(`/v1/User/HR`, { params });
    return data.data.data;
  }

  async getMembers(params: {
    page: number;
    count: number;
    name?: string;
    committee?: Committee;
    graduationYear?: number;
    position?: Position; // Position enum value (GET /v1/Members filter)
    sortBy?: string;
  }) {
    const queryParams: Record<string, string | number> = {
      Page: params.page,
      Count: params.count,
    };
    if (params.name) queryParams.Name = params.name;
    if (params.committee) queryParams.Committee = params.committee;
    if (params.graduationYear)
      queryParams.GraduationYear = params.graduationYear;
    if (params.position) queryParams.Position = params.position;
    if (params.sortBy) {
      queryParams.SortBy = params.sortBy;
      switch (params.sortBy) {
        case "az":
          queryParams.OrderBy = "FullName";
          queryParams.SortDirection = "Asc";
          break;
        case "za":
          queryParams.OrderBy = "FullName";
          queryParams.SortDirection = "Desc";
          break;
        case "caz":
          queryParams.OrderBy = "Committee";
          queryParams.SortDirection = "Asc";
          break;
        case "cza":
          queryParams.OrderBy = "Committee";
          queryParams.SortDirection = "Desc";
          break;
        default:
          queryParams.OrderBy = params.sortBy;
          break;
      }
    }

    const { data } = await systemApi.get(`/v1/Members`, {
      params: queryParams,
    });
    const paged = data.data;
    return {
      members: (paged.data as any[]).map((m) => ({
        ...m,
        name: m.fullName,
        gradYear: m.graduationYear,
      })),
      total: paged.total as number,
      totalPages: paged.totalPages as number,
      hasNextPage: paged.hasNextPage as boolean,
      hasPreviousPage: paged.hasPreviousPage as boolean,
      page: paged.page as number,
    };
  }

  async getQRCode(userId: string) {
    const { data } = await systemApi.get(`/v1/Qr/${userId}`, {
      responseType: "blob",
    });
    return URL.createObjectURL(data);
  }
}
