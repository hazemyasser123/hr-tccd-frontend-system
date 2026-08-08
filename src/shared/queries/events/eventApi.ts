import { systemApi } from "../axiosInstance";
import type { Event, Attendee, VestAttendee } from "@/shared/types/event";

const EVENTS_API_URL = "/v1/";

class eventsApi {
  async fetchEventById(id: string): Promise<Event> {
    const response = await systemApi.get(`${EVENTS_API_URL}Events/${id}`);
    return response.data.data;
  }
  
  async fetchAllEvents(page: number, pageSize: number,eventType: string, title: string, eventStatuses: string[]): Promise<{items: Event[], totalCount: number, totalPages: number}> {
    const statusParams = eventStatuses.map(status => `eventStatuses=${status}`).join('&');
    const eventTypeParam = eventType && eventType !== "All" ? `eventType=${eventType}&` : "";
    const response = await systemApi.get(`${EVENTS_API_URL}Events/filtered?${eventTypeParam}${statusParams}&page=${page}&count=${pageSize}&${title != "" ? `title=${title}` : ""}&page=${page}&count=${pageSize}&OrderBy=startDate&Descending=true`);
    return {items: response.data.data.data, totalCount: response.data.data.totalCount, totalPages: response.data.data.totalPages};
  }

  async createEvent(eventData: Omit<Event, "id">) {
    const response = await systemApi.post(
      EVENTS_API_URL + `Events/`,
      eventData
    );
    return response.data;
  }

  async updateEvent(eventId: string, eventData: Omit<Event, "id">) {
    const response = await systemApi.put(
      EVENTS_API_URL + `Events/${eventId}`,
      eventData
    );
    return response.data;
  }

  async deleteEvent(eventId: string) {
    const response = await systemApi.delete(
      EVENTS_API_URL + `Events/${eventId}`
    );
    return response.data;
  }

  async checkOngoingEvent(toDate: string): Promise<Event | null> {
    const response = await systemApi.get(
      `${EVENTS_API_URL}Events/filtered?toDate=${toDate}`
    );
    const items = response.data.data?.items;
    return items && items.length > 0 ? items[0] : null;
  }

  async fetchEventAttendees(eventId: string): Promise<Attendee[]> {
    const response = await systemApi.get(
      `${EVENTS_API_URL}Attendance/${eventId}`
    );

    const items = Array.isArray(response.data?.data)
      ? response.data.data.map((att: any) => ({
          ...att,
          name: att.fullName,
          id: att.memberId,
        }))
      : [];

    return items;
  }

  async fetchVestEventAttendees(eventId: string): Promise<VestAttendee[]> {
    const response = await systemApi.get(`${EVENTS_API_URL}Vest/members`, {
      params: { eventId: eventId, pageSize: 200 },
    });

    const items = response.data.data.data.map((att: any) => ({
      id: att.memberId,
      name: att.name,
      phoneNumber: att.phoneNumber,
      committee: att.committee,
      email: att.email,
      status: att.status,
    }));

    return items;
  }

  async updateVestStatus(memberId: string, eventId: string, action: "Returned" | "Received") {
    await systemApi.put(
      `${EVENTS_API_URL}Vest/status`,
      { status: action, memberId: memberId, eventId: eventId }
     );
  }

  async fetchVestTimeline(memberId: string, eventId: string, pageNumber: number = 1, pageSize: number = 100) {
    const response = await systemApi.get(
      `${EVENTS_API_URL}Vest/activity`,
      {
        params: {
          MemberId: memberId,
          EventId: eventId,
          PageNumber: pageNumber,
          PageSize: pageSize
        }
      }
    );
    
    // The API now returns member data with nested activities array
    // Extract the activities array from the first member (should only be one member matching the memberId)
    const memberData = response.data?.data?.data?.[0];
    if (memberData && Array.isArray(memberData.activities)) {
      return {
        ...response.data.data,
        data: memberData.activities
      };
    }
    
    // Return empty structure if no activities found
    return {
      ...response.data.data,
      data: []
    };
  }
  
  async fetchVestStatus(memberId: string, eventId: string): Promise<string> {
    const response = await systemApi.get(`${EVENTS_API_URL}Vest/status/${eventId}/${memberId}`
    );
    return response.data.data.status;
  }

  async requestAttendance(memberId: string, eventId: string) {
    const response = await systemApi.post(
      EVENTS_API_URL + `Attendance/${eventId}/${memberId}`,
      {
        scanTime: new Date().toISOString(),
      }
    );
    return response.data;
  }

  async checkAttendanceStatus(
    memberId: string,
    eventId: string
  ): Promise<{ status: number }> {
    const response = await systemApi.post(
      EVENTS_API_URL + `Attendance/${eventId}/${memberId}/status`,
      {
        scanTime: new Date().toISOString(),
      }
    );
    return { status: response.data.data };
  }

  async recordLateArrivalExcuse(
    memberId: string,
    eventId: string,
    excuse: string
  ) {
    // Add 3 hours to current time and format as ISO string
    const now = new Date();

    const scanTime = now.toISOString();
    const response = await systemApi.post(
      EVENTS_API_URL + `Attendance/${eventId}/lateArrival/${memberId}`,
      {
        scanTime,
        execuse: excuse,
      }
    );
    return response.data;
  }

  async recordLeaveEarly(memberId: string, eventId: string, excuse: string) {
    // Add 3 hours to current time and format as ISO string
    const now = new Date();

    const scanTime = now.toISOString();
    const response = await systemApi.post(
      EVENTS_API_URL + `Attendance/${eventId}/earlyLeave/${memberId}`,
      {
        scanTime,
        execuse: excuse,
      }
    );
    return response.data;
  }
}

// Export a singleton instance for use across the application
export const eventsApiInstance = new eventsApi();
