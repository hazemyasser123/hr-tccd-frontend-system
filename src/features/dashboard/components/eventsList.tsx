import type { Event } from "@/shared/types/event";
import EventCard from "./EventCard";
import { useState } from "react";
import { EventModal } from "@/features/events/components";
import { useDeleteEvent } from "@/shared/queries/events/eventQueries";
import DeleteEventModal from "./DeleteEventModal";

interface EventsListProps {
  events: Omit<Event, "attendees">[];
  userRole?: string[];
}

const EventsList = ({ events, userRole = [] }: EventsListProps) => {
  // Ensure events is always an array
  const eventsArray = Array.isArray(events) ? events : [];

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState<string | null>(null);

  const deleteEventMutation = useDeleteEvent();

  const isAdmin = userRole.includes("Admin");

  const handleEdit = (eventId: string) => {
    const eventToEdit = eventsArray.find((event) => event.id === eventId);
    if (eventToEdit) {
      setEditingEvent(eventToEdit as Event);
      setModalMode("edit");
      setIsModalOpen(true);
    }
  };

  const handleDelete = (eventId: string) => {
    setEventIdToDelete(eventId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventIdToDelete) return;
    try {
      await deleteEventMutation.mutateAsync(eventIdToDelete);
      setDeleteModalOpen(false);
      setEventIdToDelete(null);
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-[1%] gap-y-4">
        {eventsArray.length === 0 ? (
          <p className="text-inactive-tab-text text-center w-full font-semibold text-[16px] md:text-[18px] lg:text-[20px] mt-10">
            Sorry, no upcoming events to display.
          </p>
        ) : (
          eventsArray.map((event: Omit<Event, "attendees">) => (
            <div
              className="w-full md:w-[49.5%]"
              key={event.id}
            >
              <EventCard
                event={event}
                onEdit={isAdmin ? handleEdit : undefined}
                onDelete={isAdmin ? () => handleDelete(event.id) : undefined}
              />
            </div>
          ))
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={editingEvent}
        mode={modalMode}
      />

      {/* Delete Event Modal */}
      <DeleteEventModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEventIdToDelete(null);
        }}
        onDelete={confirmDelete}
        isLoading={deleteEventMutation.status === "pending"}
      />
    </>
  );
};

export default EventsList;
