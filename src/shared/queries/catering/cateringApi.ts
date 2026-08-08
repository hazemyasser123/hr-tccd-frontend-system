import { systemApi } from "../axiosInstance";
import type {
  CateringItem,
  AllocatedCateringItem,
} from "@/shared/types/catering";
import { getErrorMessage } from "@/shared/utils";
import toast from "react-hot-toast";

const CATERING_API_URL = "/v1/catering/";

class cateringApi {
  async fetchCateringItems(): Promise<CateringItem[]> {
    try {
      const response = await systemApi.get(`${CATERING_API_URL}items`);
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to fetch catering items. Please try again.",
      );
      throw error;
    }
  }

  async addCateringItem(
    itemData: Omit<CateringItem, "id" | "quantity">,
  ): Promise<CateringItem> {
    try {
      const response = await systemApi.post(
        CATERING_API_URL + `items/`,
        itemData,
      );
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to add catering item. Please try again.",
      );
      throw error;
    }
  }

  async deleteCateringItem(itemId: string): Promise<void> {
    try {
      const response = await systemApi.delete(
        CATERING_API_URL + `items/${itemId}`,
      );
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to delete catering item. Please try again.",
      );
      throw error;
    }
  }

  async updateCateringItem(
    itemId: string,
    itemData: Omit<CateringItem, "id" | "quantity">,
  ): Promise<CateringItem> {
    try {
      const response = await systemApi.put(
        CATERING_API_URL + `items/${itemId}`,
        itemData,
      );
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to update catering item. Please try again.",
      );
      throw error;
    }
  }

  async fetchEventCateringItems(
    id: string,
    memberId?: string,
  ): Promise<AllocatedCateringItem[]> {
    try {
      const response = await systemApi.get(
        `${CATERING_API_URL}allocations/Events/${id}` +
          (memberId ? `?memberId=${memberId}` : ""),
      );
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to fetch event catering items. Please try again.",
      );
      throw error;
    }
  }

  async editCateringAllocation(
    eventId: string,
    memberId: string,
    cateringItemId: string,
    quantity: number,
  ): Promise<void> {
    try {
      const response = await systemApi.put(CATERING_API_URL + `allocations/`, {
        eventId,
        memberId,
        cateringItemId,
        quantity,
      });
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to edit catering allocation. Please try again.",
      );
      throw error;
    }
  }

  async bulkAllocateCateringItems(
    eventId: string,
    memberIds: string[],
    items: { cateringItemId: string; amount: number }[],
  ): Promise<void> {
    try {
      const response = await systemApi.put(
        CATERING_API_URL + `allocations/bulk`,
        {
          eventId,
          memberIds,
          items,
        },
        { timeout: 600000 }, // 10 minutes timeout
      );
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to bulk allocate catering items. Please try again.",
      );
      throw error;
    }
  }

  async bulkDeleteCateringAllocations(
    eventId: string,
    memberIds: string[],
    cateringItemIds: string[],
  ): Promise<void> {
    try {
      const response = await systemApi.delete(
        CATERING_API_URL + `allocations/bulk`,
        {
          data: {
            eventId,
            memberIds,
            cateringItemIds,
          },
          timeout: 600000, // 10 minutes timeout
        },
      );
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to bulk delete catering allocations. Please try again.",
      );
      throw error;
    }
  }

  async consumeCateringItems(
    eventId: string,
    memberId: string,
    items: { cateringItemId: string; quantity: number }[],
  ): Promise<void> {
    try {
      const response = await systemApi.post(CATERING_API_URL + `consume/bulk`, {
        eventId,
        memberId,
        items,
      });
      return response.data.data;
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          "Failed to consume catering items. Please try again.",
      );
      throw error;
    }
  }
}
// Export a singleton instance for use across the application
export const cateringApiInstance = new cateringApi();
