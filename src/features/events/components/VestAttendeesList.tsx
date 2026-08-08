import type { VestAttendee } from "@/shared/types/event";
import { useState, useEffect } from "react";
import { SearchField, Button } from "tccd-ui";
import Table from "@/shared/components/table/Table";
import CardView from "@/shared/components/table/CardView";
import VestActionModal from "./VestActionModal";
import VestTimelineModal from "./VestTimelineModal";
import { useUpdateVestStatus } from "@/shared/queries/events";
import toast from "react-hot-toast";
import VestStatusBadge from "./VestStatusBadge";
import format from "@/shared/utils/Formater";

interface VestAttendeesListProps {
  attendees: VestAttendee[];
  eventId?: string;
  setAttendees: (data: VestAttendee[]) => void;
}

const VestAttendeesList = ({
  attendees,
  eventId,
  setAttendees,
}: VestAttendeesListProps) => {
  const [displayedAttendees, setDisplayedAttendees] =
    useState<VestAttendee[]>(attendees);
  const [searchKey, setSearchKey] = useState<string>("");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    attendee: VestAttendee | null;
    action: "assign" | "return" | null;
  }>({ isOpen: false, attendee: null, action: null });
  const [timelineModal, setTimelineModal] = useState<{
    isOpen: boolean;
    attendee: VestAttendee | null;
  }>({ isOpen: false, attendee: null });

  const updateEventStatus = useUpdateVestStatus();

  const handleActionClick = (
    attendee: VestAttendee,
    action: "assign" | "return"
  ) => {
    setModalState({ isOpen: true, attendee, action });
  };

  const handleTimelineClick = (attendee: VestAttendee) => {
    setTimelineModal({ isOpen: true, attendee });
  };

  const renderActionButton = (attendee: VestAttendee) => {
    const getActionButton = () => {
      switch (attendee.status) {
        case "NotReceived":
          return (
            <Button
              buttonText="Assign Vest"
              onClick={() => handleActionClick(attendee, "assign")}
              type="tertiary"
              width="auto"
            />
          );
        case "Received":
          return (
            <Button
              buttonText="Return Vest"
              onClick={() => handleActionClick(attendee, "return")}
              type="secondary"
              width="auto"
            />
          );
        case "Returned":
          return (
            <Button
              buttonText="Assign Vest"
              onClick={() => handleActionClick(attendee, "assign")}
              type="tertiary"
              width="auto"
            />
          );
        default:
          return null;
      }
    };

    return (
      <div className="flex items-center gap-2">
        <div className="[&>button]:!mt-0 [&>button]:!lg:mt-0">
          {getActionButton()}
        </div>
        <div className="[&>button]:!mt-0 [&>button]:!lg:mt-0">
          <Button
            buttonText="Timeline"
            onClick={() => handleTimelineClick(attendee)}
            type="ghost"
            width="auto"
          />
        </div>
      </div>
    );
  };

  const handleModalConfirm = async () => {
    if (modalState.attendee && modalState.action) {
      await updateEventStatus.mutateAsync({
        eventId: eventId || "",
        memberId: modalState.attendee.id || "",
        action: modalState.action === "assign" ? "Received" : "Returned",
      });

      setAttendees(
        attendees.map((attendee: VestAttendee) => {
          if (attendee.id === modalState.attendee?.id) {
            return {
              ...attendee,
              status:
                modalState.action === "assign" ? "Received" : "Returned",
            };
          }
          return attendee;
        })
      );

      toast.success(
        `Vest ${modalState.action === "assign" ? "assigned" : "returned"
        } successfully.`
      );
      setTimeout(() => {
        setModalState({ isOpen: false, attendee: null, action: null });
      }, 500);

    }
  };

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
          { key: "name", label: "Name" },
          {
            key: "phoneNumber",
            label: "Phone",
            width: "w-32 min-w-32",
            formatter: (value) => format(value, "phone"),
          },
          { key: "committee", label: "Team" },
          {
            key: "status",
            label: "Status",
            formatter: (value) => <VestStatusBadge status={value} />,
          },
        ]}
        emptyMessage="No attendees found."
        renderActions={(attendee) => renderActionButton(attendee)}
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
            formatter: (value) => <VestStatusBadge status={value} />,
            fullWidth: true,
          },
        ]}
        emptyMessage="No attendees found."
        renderButtons={(attendee) => renderActionButton(attendee)}
      />

      <VestActionModal
        isOpen={modalState.isOpen}
        onClose={() =>
          setModalState({ isOpen: false, attendee: null, action: null })
        }
        isSubmitting={updateEventStatus.isPending}
        onConfirm={handleModalConfirm}
        attendeeName={modalState.attendee?.name || ""}
        action={modalState.action || "assign"}
      />

      <VestTimelineModal
        isOpen={timelineModal.isOpen}
        onClose={() => setTimelineModal({ isOpen: false, attendee: null })}
        attendeeName={timelineModal.attendee?.name || ""}
        memberId={String(timelineModal.attendee?.id || "")}
        eventId={eventId || ""}
      />
    </div>
  );
};

export default VestAttendeesList;
