import type { Attendee } from "@/shared/types/event";
import { useEffect, useState } from "react";
import AttendeeTimelineModal from "./AttendeeTimelineModal";
import { SearchField, Button } from "tccd-ui";
import Table from "@/shared/components/table/Table";
import CardView from "@/shared/components/table/CardView";
import format from "@/shared/utils/Formater";
import StatusBadge from "./StatusBadge";

interface AttendeesListProps {
  attendees: Attendee[];
  eventEndTime?: string;
}

const AttendeesList = ({ attendees, eventEndTime }: AttendeesListProps) => {
  const [displayedAttendees, setDisplayedAttendees] =
    useState<Attendee[]>(attendees);
  const [searchKey, setSearchKey] = useState<string>("");
  const [attendeeTimeline, setAttendeeTimeline] = useState<Attendee | null>(
    null
  );

  useEffect(() => {
    if (searchKey.trim() === "") {
      setDisplayedAttendees(attendees);
    } else {
      const lowerSearchKey = searchKey.toLowerCase();
      const filtered = attendees.filter((attendee) =>
        attendee.name.toLowerCase().includes(lowerSearchKey)
      );
      setDisplayedAttendees(filtered);
    }
  }, [searchKey, attendees]);

  return (
    <div className="bg-white dark:bg-surface-glass-bg rounded-b-lg shadow-sm border border-dashboard-card-border border-t-0 overflow-x-auto -mt-1">
      {attendeeTimeline !== null && (
        <AttendeeTimelineModal
          onCLose={() => setAttendeeTimeline(null)}
          Attendee={attendeeTimeline}
        />
      )}
      <div className="p-4 border-b border-dashboard-border flex md:flex-row flex-col gap-2 md:gap-4 items-center">
        <h3 className="text-lg font-bold text-text-muted-foreground">
          Attendees {attendees?.length ? `(${attendees.length})` : ""}
        </h3>
        <SearchField
          placeholder="Search attendees..."
          value={searchKey}
          onChange={(value) => setSearchKey(value)}
        />
      </div>
      {/* Desktop Table View */}
      <Table
        items={displayedAttendees}
        columns={[
          {
            key: "name",
            label: "Name",
            formatter: (value) => value || "N/A",
          },
          {
            key: "phoneNumber",
            label: "Phone",
            width: "w-32 min-w-32",
            formatter: (value) => format(value, "phone"),
          },
          {
            key: "committee",
            label: "Team",
            formatter: (value) => value || "N/A",
          },
          {
            key: "status",
            label: "Status",
            formatter: (value) => <StatusBadge status={value} />,
          },
          {
            key: "attendanceRecords",
            label: "Arrival",
            width: "w-40 min-w-40",
            formatter: (value: Attendee["attendanceRecords"]) => {
              if (
                value.length > 0 &&
                String(value[0].checkInTime) !== "0001-01-01T00:00:00+00:00"
              ) {
                return format(new Date(value[0].checkInTime), "full");
              }
              return "N/A";
            },
          },
          {
            key: "attendanceRecords",
            label: "Leaving",
            width: "w-40 min-w-40",
            formatter: (value: Attendee["attendanceRecords"]) => {
              if (value.length > 0 && value[value.length - 1].checkOutTime) {
                return format(
                  new Date(value[value.length - 1].checkOutTime!),
                  "full"
                );
              }
              if (eventEndTime) {
                return new Date() < new Date(eventEndTime)
                  ? "Still checked in"
                  : format(new Date(eventEndTime), "full");
              }
              return "N/A";
            },
          },
          {
            key: "attendanceRecords",
            label: "Late Arrival Reason",
            formatter: (value: Attendee["attendanceRecords"]) => (
              <p className="break-words leading-relaxed">
                {value[0]?.lateArrivalExcuse || "N/A"}
              </p>
            ),
          },
          {
            key: "attendanceRecords",
            label: "Early Leaving Reason",
            formatter: (value: Attendee["attendanceRecords"]) => (
              <p className="break-words leading-relaxed">
                {value[value.length - 1]?.earlyLeaveExcuse || "N/A"}
              </p>
            ),
          },
        ]}
        emptyMessage="No attendees found"
        renderActions={(attendee) => (
          <Button
            buttonText="View Timeline"
            onClick={() => setAttendeeTimeline(attendee)}
            type="secondary"
            width="auto"
          />
        )}
      />

      {/* Mobile Card View */}
      <CardView
        items={displayedAttendees}
        titleKey="name"
        renderedFields={[
          {
            key: "phoneNumber",
            label: "Phone",
            formatter: (value) => format(value, "phone"),
          },
          { key: "committee", label: "Team" },
          {
            key: "status",
            label: "Status",
            formatter: (value) => <StatusBadge status={value} />,
          },
          {
            key: "attendanceRecords",
            label: "Arrival",
            formatter: (value: Attendee["attendanceRecords"]) => {
              if (
                value.length > 0 &&
                String(value[0].checkInTime) !== "0001-01-01T00:00:00+00:00"
              ) {
                return format(new Date(value[0].checkInTime), "full");
              }
              return "N/A";
            },
          },
          {
            key: "attendanceRecords",
            label: "Leaving",
            formatter: (value: Attendee["attendanceRecords"]) => {
              if (value.length > 0 && value[value.length - 1].checkOutTime) {
                return format(
                  new Date(value[value.length - 1].checkOutTime!),
                  "full"
                );
              }
              if (eventEndTime) {
                return new Date() < new Date(eventEndTime)
                  ? "Still checked in"
                  : format(new Date(eventEndTime), "full");
              }
              return "N/A";
            },
          },
          {
            key: "attendanceRecords",
            label: "Late Arrival Reason",
            formatter: (value: Attendee["attendanceRecords"]) => (
              <p className="break-words leading-relaxed">
                {value[0]?.lateArrivalExcuse || "N/A"}
              </p>
            ),
          },
          {
            key: "attendanceRecords",
            label: "Early Leaving Reason",
            formatter: (value: Attendee["attendanceRecords"]) => (
              <p className="break-words leading-relaxed">
                {value[value.length - 1]?.earlyLeaveExcuse || "N/A"}
              </p>
            ),
          },
        ]}
        emptyMessage="No attendees found"
        renderButtons={(attendee) => (
          <div
            onClick={() => setAttendeeTimeline(attendee)}
            className="px-3 py-2 rounded-full cursor-pointer text-xs font-bold capitalize whitespace-nowrap text-white bg-secondary shadow-sm"
          >
            View Timeline
          </div>
        )}
      />
    </div>
  );
};

export default AttendeesList;
