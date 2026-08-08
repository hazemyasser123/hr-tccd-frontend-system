import type { CateringItem } from "@/shared/types/catering";
import type {
  Company,
  CompanyAllocationItemConsume,
  CompanyAllocationItemInput,
  CompanyCateringAllocation,
  CompanyPayload,
} from "@/shared/types/company";
import { systemApi } from "../axiosInstance";
import { getErrorMessage } from "@/shared/utils";
import toast from "react-hot-toast";

const COMPANY_API_URL = "/v1/Company";
const COMPANY_CATERING_API_URL = "/v1/CompanyCatering";
const CATERING_ITEMS_API_URL = "/v1/catering/items";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

class CompaniesApi {
  async fetchEventCompanies(): Promise<Company[]> {
    try {
      const response =
        await systemApi.get<ApiResponse<Company[]>>(COMPANY_API_URL);
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to fetch companies. Please try again.",
      );
      throw error;
    }
  }

  async fetchEventCompanyCatering(
    eventId: string,
    companyId?: string,
  ): Promise<CompanyCateringAllocation[]> {
    try {
      const response = await systemApi.get<
        ApiResponse<CompanyCateringAllocation[]>
      >(`${COMPANY_CATERING_API_URL}/allocations/events/${eventId}`, {
        params: companyId ? { companyId } : undefined,
      });
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to fetch company catering items. Please try again.",
      );
      throw error;
    }
  }

  async fetchCompanyCateringItems(): Promise<CateringItem[]> {
    try {
      const response = await systemApi.get(CATERING_ITEMS_API_URL);
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to fetch catering items. Please try again.",
      );
      throw error;
    }
  }

  async addCompanyCateringItem(
    itemData: Omit<CateringItem, "id" | "quantity">,
  ): Promise<CateringItem> {
    try {
      const response = await systemApi.post(CATERING_ITEMS_API_URL, itemData);
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to add catering item. Please try again.",
      );
      throw error;
    }
  }

  async addCompany(payload: CompanyPayload): Promise<Company> {
    try {
      const response = await systemApi.post<ApiResponse<Company>>(
        COMPANY_API_URL,
        payload,
      );
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) || "Failed to add company. Please try again.",
      );
      throw error;
    }
  }

  async updateCompany(
    companyId: string,
    payload: CompanyPayload,
  ): Promise<Company> {
    try {
      const response = await systemApi.put<ApiResponse<Company>>(
        `${COMPANY_API_URL}/${companyId}`,
        payload,
      );
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) || "Failed to update company. Please try again.",
      );
      throw error;
    }
  }

  async deleteCompany(companyId: string): Promise<void> {
    try {
      await systemApi.delete(`${COMPANY_API_URL}/${companyId}`);
    } catch (error) {
      toast.error(
        getErrorMessage(error) || "Failed to delete company. Please try again.",
      );
      throw error;
    }
  }

  async allocateCompanyCateringItems(
    companyId: string,
    eventId: string,
    cateringItemId: string,
    amount: number,
  ): Promise<void> {
    try {
      await systemApi.put(
        `${COMPANY_CATERING_API_URL}/allocations`,
        {
          companyId,
          eventId,
          cateringItemId,
          amount,
        },
        { timeout: 600000 }, // 10 minutes timeout
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to allocate catering item. Please try again.",
      );
      throw error;
    }
  }

  async bulkAllocateCompanyCateringItems(
    eventId: string,
    companyIds: string[],
    items: CompanyAllocationItemInput[],
  ): Promise<void> {
    try {
      await systemApi.put(`${COMPANY_CATERING_API_URL}/allocations/bulk`, {
        eventId,
        companyIds,
        items,
      });
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to bulk allocate catering items. Please try again.",
      );
      throw error;
    }
  }

  async bulkDeleteCompanyCateringAllocations(
    eventId: string,
    companyIds: string[],
    cateringItemIds: string[],
  ): Promise<void> {
    try {
      await systemApi.delete(`${COMPANY_CATERING_API_URL}/allocations/bulk`, {
        data: {
          eventId,
          companyIds,
          cateringItemIds,
        },
      });
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to bulk delete catering allocations. Please try again.",
      );
      throw error;
    }
  }

  async sendCompanyCateringAllocationsEmail(
    eventId: string,
    companyId: string,
    additionalEmails: string[] = [],
  ): Promise<{ requestedCount: number; sentCount: number }> {
    const response = await systemApi.post<{
      success: boolean;
      statusCode: number;
      message: string;
      data: { requestedCount: number; sentCount: number };
    }>(`${COMPANY_CATERING_API_URL}/allocations/send-email`, {
      eventId,
      companyId,
      additionalEmails,
    });
    return response.data.data;
  }

  async bulkSendCompanyCateringAllocationsEmail(
    eventId: string,
    companyIds: string[],
  ): Promise<{ requestedCount: number; sentCount: number }> {
    try {
      const response = await systemApi.post<{
        success: boolean;
        statusCode: number;
        message: string;
        data: { requestedCount: number; sentCount: number };
      }>(`${COMPANY_CATERING_API_URL}/allocations/send-email/bulk`, {
        eventId,
        companyIds,
      });
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to send catering allocation emails. Please try again.",
      );
      throw error;
    }
  }

  async consumeCompanyCateringItem(
    companyId: string,
    eventId: string,
    cateringItemId: string,
    quantity: number,
  ): Promise<void> {
    try {
      await systemApi.post(`${COMPANY_CATERING_API_URL}/consume`, {
        companyId,
        eventId,
        cateringItemId,
        quantity,
      });
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to consume catering item. Please try again.",
      );
      throw error;
    }
  }

  async bulkConsumeCompanyCateringItems(
    companyId: string,
    eventId: string,
    items: CompanyAllocationItemConsume[],
  ): Promise<void> {
    try {
      await systemApi.post(`${COMPANY_CATERING_API_URL}/consume/bulk`, {
        companyId,
        eventId,
        items,
      });
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to bulk consume catering items. Please try again.",
      );
      throw error;
    }
  }
}

export const companiesApiInstance = new CompaniesApi();
