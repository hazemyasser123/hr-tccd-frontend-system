import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CateringItem } from "@/shared/types/catering";
import type {
  CompanyAllocationItemConsume,
  CompanyAllocationItemInput,
  CompanyPayload,
} from "@/shared/types/company";
import { companiesApiInstance } from "./companiesApi";

export const companyKeys = {
  all: ["company-catering"] as const,
  items: () => [...companyKeys.all, "items"] as const,
  eventCompanies: (eventId: string) =>
    [...companyKeys.all, "event-companies", eventId] as const,
  eventAllocations: (eventId: string, companyId?: string) =>
    [...companyKeys.all, "event-allocations", eventId, companyId] as const,
};

export const useEventCompanies = (eventId: string, enabled = true) => {
  return useQuery({
    queryKey: companyKeys.eventCompanies(eventId),
    queryFn: () => companiesApiInstance.fetchEventCompanies(),
    enabled,
  });
};

export const useEventCompanyCatering = (
  eventId: string,
  companyId?: string,
  enabled = true
) => {
  return useQuery({
    queryKey: companyKeys.eventAllocations(eventId, companyId),
    queryFn: () => companiesApiInstance.fetchEventCompanyCatering(eventId, companyId),
    enabled: !!eventId && enabled,
  });
};

export const useCompanyCateringItems = () => {
  return useQuery({
    queryKey: companyKeys.items(),
    queryFn: () => companiesApiInstance.fetchCompanyCateringItems(),
  });
};

export const useAddCompanyCateringItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemData: Omit<CateringItem, "id" | "quantity">) =>
      companiesApiInstance.addCompanyCateringItem(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.items() });
    },
  });
};

export const useAddCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { eventId: string; payload: CompanyPayload }) =>
      companiesApiInstance.addCompany(variables.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: companyKeys.eventAllocations(variables.eventId),
      });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      eventId: string;
      companyId: string;
      payload: CompanyPayload;
    }) => companiesApiInstance.updateCompany(variables.companyId, variables.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: companyKeys.eventAllocations(variables.eventId),
      });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { eventId: string; companyId: string }) =>
      companiesApiInstance.deleteCompany(variables.companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: companyKeys.eventAllocations(variables.eventId),
      });
    },
  });
};

export const useAllocateCompanyCateringItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      eventId,
      cateringItemId,
      amount,
    }: {
      companyId: string;
      eventId: string;
      cateringItemId: string;
      amount: number;
    }) =>
      companiesApiInstance.allocateCompanyCateringItems(
        companyId,
        eventId,
        cateringItemId,
        amount,
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.eventAllocations(variables.eventId),
      });
    },
  });
} 

export const useBulkAllocateCompanyCateringItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      companyIds,
      items,
    }: {
      eventId: string;
      companyIds: string[];
      items: CompanyAllocationItemInput[];
    }) => companiesApiInstance.bulkAllocateCompanyCateringItems(eventId, companyIds, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.eventAllocations(variables.eventId),
      });
    },
  });
};

export const useBulkDeleteCompanyCateringAllocations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      companyIds,
      cateringItemIds,
    }: {
      eventId: string;
      companyIds: string[];
      cateringItemIds: string[];
    }) =>
      companiesApiInstance.bulkDeleteCompanyCateringAllocations(
        eventId,
        companyIds,
        cateringItemIds
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.eventAllocations(variables.eventId),
      });
    },
  });
}

export const useSendCompanyCateringAllocationsEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      companyId,
      additionalEmails = [],
    }: {
      eventId: string;
      companyId: string;
      additionalEmails?: string[];
    }) =>
      companiesApiInstance.sendCompanyCateringAllocationsEmail(
        eventId,
        companyId,
        additionalEmails
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.eventAllocations(variables.eventId),
      });
    },
  });
};

export const useBulkSendCompanyCateringAllocationsEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      companyIds,
    }: {
      eventId: string;
      companyIds: string[];
    }) =>
      companiesApiInstance.bulkSendCompanyCateringAllocationsEmail(
        eventId,
        companyIds,
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.eventAllocations(variables.eventId),
      });
    },
  });
};

export const useConsumeCompanyCateringItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      eventId,
      cateringItemId,
      quantity,
    }: {
      companyId: string;
      eventId: string;
      cateringItemId: string;
      quantity: number;
    }) =>
      companiesApiInstance.consumeCompanyCateringItem(
        companyId,
        eventId,
        cateringItemId,
        quantity
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.eventAllocations(variables.eventId),
      });
    },
  });
};

export const useBulkConsumeCompanyCateringItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      eventId,
      items,
    }: {
      companyId: string;
      eventId: string;
      items: CompanyAllocationItemConsume[];
    }) =>
      companiesApiInstance.bulkConsumeCompanyCateringItems(
        companyId,
        eventId,
        items
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.eventAllocations(variables.eventId),
      });
    }
  });
}

