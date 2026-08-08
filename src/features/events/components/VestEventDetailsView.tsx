import WithNavbar from "@/shared/components/hoc/WithNavbar";
import {
  EventDetailsHeader,
  VestEventInformation,
  VestAttendeesList,
  EventModal,
} from "@/features/events/components";
import type { Event, VestAttendee } from "@/shared/types/event";
import { useState } from "react";

interface VestEventDetailsViewProps {
  event: Event;
  attendees: VestAttendee[];
  onBack: () => void;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  setAttendees: (data: VestAttendee[]) => void;
}

const VestEventDetailsView: React.FC<VestEventDetailsViewProps> = ({
  event,
  attendees,
  onBack,
  onEdit,
  onDelete,
  setAttendees,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const handleEdit = (eventId: string) => {
    if (event && event.id === eventId) {
      setEditingEvent(event);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <WithNavbar>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <EventDetailsHeader onBack={onBack} isAdmin={false} />
          <VestEventInformation
            event={event}
            attendees={attendees}
            onEdit={onEdit ? handleEdit : undefined}
            onDelete={onDelete}
          />
          <VestAttendeesList
            attendees={attendees || []}
            eventId={event.id}
            setAttendees={setAttendees}
          />
        </div>
      </div>
      <EventModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        event={editingEvent}
        mode="edit"
      />
    </WithNavbar>
  );
};

export default VestEventDetailsView;
