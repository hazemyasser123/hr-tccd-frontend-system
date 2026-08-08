import type { member } from "@/shared/types/member";
import { systemApi } from "../axiosInstance";
import type { User } from "@/shared/types/user";

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
    committee?: string;
    graduationYear?: number;
    position?: string;
  }) {
    const queryParams: Record<string, string | number> = {
      pageNumber: params.page,
      pageSize: params.count,
    };
    if (params.name) queryParams.Name = params.name;
    if (params.committee && params.committee !== "All")
      queryParams.Committee = params.committee;
    if (params.graduationYear)
      queryParams.GraduationYear = params.graduationYear;
    if (params.position && params.position !== "All")
      queryParams.Position = params.position;

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

  async createUser(userData: member, password?: string) {
    const mappedData = {
      fullName: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      committee: userData.committee,
      position: userData.position,
      nationalId: userData.nationalId,
      major: userData.engineeringMajor,
      educationSystem: userData.educationSystem,
      graduationYear: userData.gradYear,
      password: password,
    };

    const { data } = await systemApi.post(`/v1/Members`, mappedData);
    return data;
  }

  async updateUser(userId: string, userData: member) {
    const mappedData = {
      fullName: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      committee: userData.committee,
      position: userData.position,
      nationalId: userData.nationalId,
      major: userData.engineeringMajor,
      educationSystem: userData.educationSystem,
      graduationYear: userData.gradYear,
    };

    const { data } = await systemApi.put(`/v1/Members/${userId}`, mappedData);
    return data;
  }

  async deleteUser(userId: string) {
    const { data } = await systemApi.delete(`/v1/Members/${userId}`);
    return data;
  }

  async deleteAccount(userId: string) {
    const { data } = await systemApi.delete(
      `/v1/Auth/delete-account/${userId}`,
    );
    return data;
  }

  async sendQRCode(userId: string) {
    const { data } = await systemApi.post(`/v1/Members/qr-code/${userId}`);
    return data;
  }
}
