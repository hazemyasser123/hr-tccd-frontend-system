import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApiInstance } from "./eventApi";
import toast from "react-hot-toast";
import type { Event } from "@/shared/types/event";
import { getErrorMessage } from "@/shared/utils";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters: string) => [...eventKeys.lists(), { filters }] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  pastEvents: () => [...eventKeys.all, "past"] as const,
  eventTypes: () => [...eventKeys.all, "types"] as const,
  eventsByType: (type: string) => [...eventKeys.all, "byType", type] as const,
  searchPastEvents: (query: string) =>
    [...eventKeys.all, "searchPast", query] as const,
  upcomingEvents: () => [...eventKeys.all, "upcoming"] as const,
  eventAttendees: (eventId: string) =>
    [...eventKeys.details(), eventId, "attendees"] as const,
  ongoingEvent: (toDate: string) => ["ongoing", toDate] as const,
  requestAttendance: (eventId: string, memberId: string) =>
    ["requestAttendance", eventId, memberId] as const,
  checkAttendanceStatus: (eventId: string, memberId: string) =>
    ["checkAttendanceStatus", eventId, memberId] as const,
  recordLateArrivalExcuse: (eventId: string, memberId: string) =>
    ["recordLateArrivalExcuse", eventId, memberId] as const,
  recordLeaveEarly: (eventId: string, memberId: string) =>
    ["recordLeaveEarly", eventId, memberId] as const,
  vestTimeline: (eventId: string, memberId: string) =>
    ["vestTimeline", eventId, memberId] as const,
  vestStatus: (eventId: string, memberId: string) =>
    ["vestStatus", eventId, memberId] as const,
};
// Mutation: Request Attendance
export const useRequestAttendance = () => {
  return useMutation({
    mutationFn: async ({
      memberId,
      eventId,
    }: {
      memberId: string;
      eventId: string;
    }) => {
      try {
        return await eventsApiInstance.requestAttendance(memberId, eventId);
      } catch (error) {
        toast.error("Attendance request failed. Please try again.");
        throw error;
      }
    },
  });
};

// Mutation: Check Attendance Status
export const useCheckAttendanceStatus = () => {
  return useMutation({
    mutationFn: async ({
      memberId,
      eventId,
    }: {
      memberId: string;
      eventId: string;
    }) => {
      try {
        return await eventsApiInstance.checkAttendanceStatus(memberId, eventId);
      } catch (error) {
        toast.error(
          getErrorMessage(error) ||
            "Failed to check attendance status. Please try again.",
        );
        throw error;
      }
    },
  });
};

// Mutation: Record Late Arrival Excuse
export const useRecordLateArrivalExcuse = () => {
  return useMutation({
    mutationFn: async ({
      memberId,
      eventId,
      excuse,
    }: {
      memberId: string;
      eventId: string;
      excuse: string;
    }) => {
      try {
        return await eventsApiInstance.recordLateArrivalExcuse(
          memberId,
          eventId,
          excuse,
        );
      } catch (error) {
        toast.error(
          getErrorMessage(error) ||
            "Late arrival excuse failed. Please try again.",
        );
        throw error;
      }
    },
  });
};

// Mutation: Record Leave Early
export const useRecordLeaveEarly = () => {
  return useMutation({
    mutationFn: async ({
      memberId,
      eventId,
      excuse,
    }: {
      memberId: string;
      eventId: string;
      excuse: string;
    }) => {
      try {
        return await eventsApiInstance.recordLeaveEarly(
          memberId,
          eventId,
          excuse,
        );
      } catch (error) {
        toast.error(
          getErrorMessage(error) ||
            "Leave early excuse failed. Please try again.",
        );
        throw error;
      }
    },
  });
};

// Hook to fetch event by ID
export const useEvent = (id: string) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const data = await eventsApiInstance.fetchEventById(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useAllEvents = (
  page: number,
  pageSize: number,
  eventType: string,
  title: string,
  eventStatuses: string[],
) => {
  return useQuery({
    queryKey: [...eventKeys.lists(), page, eventType, title, eventStatuses],
    queryFn: async () => {
      const data = await eventsApiInstance.fetchAllEvents(
        page,
        pageSize,
        eventType,
        title,
        eventStatuses,
      );
      return data;
    },
  });
};

export const useAddEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventData: Omit<Event, "id">) =>
      eventsApiInstance.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.upcomingEvents() });
      queryClient.invalidateQueries({ queryKey: eventKeys.pastEvents() });
      queryClient.invalidateQueries({ queryKey: eventKeys.eventTypes() });
      toast.success("Event created successfully");
    },
    onError: () => {
      toast.error("Failed to create event. Please try again.");
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      eventData,
    }: {
      eventId: string;
      eventData: Omit<Event, "id">;
    }) => eventsApiInstance.updateEvent(eventId, eventData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.upcomingEvents() });
      queryClient.invalidateQueries({ queryKey: eventKeys.pastEvents() });
      queryClient.invalidateQueries({ queryKey: eventKeys.eventTypes() });
      queryClient.invalidateQueries({ queryKey: eventKeys.details() });
      if (variables?.eventId) {
        queryClient.invalidateQueries({
          queryKey: eventKeys.detail(variables.eventId),
        });
      }
      toast.success("Event updated successfully");
    },
    onError: () => {
      toast.error("Failed to update event. Please try again.");
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApiInstance.deleteEvent(eventId),
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.upcomingEvents() });
      queryClient.invalidateQueries({ queryKey: eventKeys.pastEvents() });
      queryClient.invalidateQueries({ queryKey: eventKeys.eventTypes() });
      queryClient.invalidateQueries({ queryKey: eventKeys.details() });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      }
      toast.success("Event deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete event. Please try again.");
    },
  });
};

export const useOngoingEvent = (toDate: string) => {
  return useQuery({
    queryKey: [...eventKeys.ongoingEvent(toDate)],
    queryFn: async () => {
      try {
        const data = await eventsApiInstance.checkOngoingEvent(toDate);
        return data;
      } catch (error) {
        toast.error("Failed to fetch ongoing event. Please try again.");
        throw error;
      }
    },
    enabled: !!toDate,
  });
};

export const useEventAttendees = (eventId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: eventKeys.eventAttendees(eventId),
    queryFn: async () => {
      try {
        const data = await eventsApiInstance.fetchEventAttendees(eventId);
        return data;
      } catch (error) {
        toast.error(getErrorMessage(error) || "Failed to fetch attendees. Please try again.");
        throw error;
      }
     
    },
    enabled: !!eventId && enabled,
  });
};

export const useUpdateVestStatus = () => {
  return useMutation({
    mutationFn: async ({
      eventId,
      memberId,
      action,
    }: {
      eventId: string;
      memberId: string;
      action: "Returned" | "Received";
    }) => {
      try {
        await eventsApiInstance.updateVestStatus(memberId, eventId, action);
      } catch (error) {
        toast.error(
          getErrorMessage(error) ||
            "Failed to update vest status. Please try again.",
        );
        throw error;
      }
    },
  });
};

// Hook to fetch vest timeline
export const useVestTimeline = (memberId: string, eventId: string) => {
  return useQuery({
    queryKey: eventKeys.vestTimeline(eventId, memberId),
    queryFn: async () => {
      try {
        const data = await eventsApiInstance.fetchVestTimeline(memberId, eventId);
        return data;
      }
      catch (error) {
        toast.error(
          getErrorMessage(error) ||
            "Failed to fetch vest timeline. Please try again.",
        );
        throw error;
      }
    },
    enabled: !!memberId && !!eventId,
  });
};

export const useVestStatus = (memberId: string, eventId: string) => {
  return useQuery({
    queryKey: eventKeys.checkAttendanceStatus(eventId, memberId),
    queryFn: async () => {
      try {
        const data = await eventsApiInstance.fetchVestStatus(memberId, eventId);
        return data;
      } catch (error) {
        toast.error(
          getErrorMessage(error) ||
            "Failed to fetch vest status. Please try again.",
        );
        throw error;
      }
    },
    enabled: !!memberId && !!eventId,
  });
};

export const useVestEventAttendees = (
  eventId: string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: [...eventKeys.eventAttendees(eventId), "vest"],
    queryFn: async () => {
      try {
        const data = await eventsApiInstance.fetchVestEventAttendees(eventId);
        return data;
      } catch (error) {
        toast.error(
          getErrorMessage(error) ||
            "Failed to fetch vest event attendees. Please try again.",
        );
        throw error;
      }
    },
    enabled: !!eventId && enabled,
  });
};
