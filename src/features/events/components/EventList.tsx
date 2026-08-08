import { SearchField, DropdownMenu, Button } from "tccd-ui";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAllEvents, useDeleteEvent } from "@/shared/queries/events";
import EVENT_TYPES from "@/constants/eventTypes";
import Table from "@/shared/components/table/Table";
import CardView from "@/shared/components/table/CardView";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { Event } from "@/shared/types/event";
import { IoTrashSharp } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { TbListDetails } from "react-icons/tb";

const EventList = ({
  setModalOpen,
  fetchedEventStatuses,
}: {
  setModalOpen?: React.Dispatch<React.SetStateAction<string>>;
  fetchedEventStatuses: string[];
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchKey, setSearchKey] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchKey);
  const userRoles = useSelector((state: any) => state.auth.user?.roles || []);

  const deleteEventMutation = useDeleteEvent();

  const handleDelete = (event: Event) => {
    deleteEventMutation.mutate(event.id, {
      onSuccess: () => {
        toast.success("Event deleted successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      onError: () => {
        toast.error("Failed to delete event");
      },
    });
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchKey), 300);
    return () => clearTimeout(t);
  }, [searchKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const { data, isLoading, isError } = useAllEvents(
    currentPage,
    20,
    selectedEventType,
    debouncedSearchTerm,
    fetchedEventStatuses,
  );
  const events = data?.items ?? [];

  return (
    <div className="bg-white dark:bg-surface-glass-bg rounded-lg shadow-sm border border-dashboard-card-border overflow-hidden">
      <div className="p-4 border-b border-dashboard-border space-y-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-md md:text-lg lg:text-xl font-bold text-text-muted-foreground">
            Events {events ? `(${events.length})` : ""}
          </p>
          <div className="flex gap-2 items-center justify-center">
            <FaChevronLeft
              className={`cursor-pointer size-4 ${currentPage === 1 ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-contrast hover:text-primary"}`}
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                }
              }}
            />
            <span className="text-[14px] md:text-[15px] lg:text-[16px] font-medium text-contrast dark:text-text-title">
              Page {currentPage}
            </span>
            <FaChevronRight
              className={`cursor-pointer size-4 ${events && events.length < 20 ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-contrast hover:text-primary"}`}
              onClick={() => {
                if (events && events.length === 20) {
                  setCurrentPage(currentPage + 1);
                }
              }}
            />
          </div>
        </div>
        <hr className="border-gray-200" />
        <p className="text-[14px] md:text-[15px] lg:text-[16px] font-semibold text-contrast">
          Filters
        </p>
        <div className="flex gap-2 md:flex-row flex-col justify-between">
          <SearchField
            placeholder="Search Event Name..."
            value={searchKey}
            onChange={(value) => setSearchKey(value)}
          />
          <div className="flex-col flex flex-1 justify-end md:flex-row gap-2">
            <div className="flex-grow md:max-w-64">
              <DropdownMenu
                options={EVENT_TYPES}
                value={selectedEventType}
                onChange={(val) => setSelectedEventType(val)}
                placeholder="Event Type"
              />
            </div>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-contrast">Loading events...</p>
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-contrast">
            Error loading events. Please try again.
          </p>
        </div>
      ) : (
        <>
          <Table
            items={events || []}
            modalTitle="Delete Event"
            modalSubTitle="Are you sure you want to delete this event? This action cannot be undone."
            isSubmitting={deleteEventMutation.isPending}
            confirmationAction={handleDelete}
            columns={[
              { key: "title", label: "Event Title", width: "w-1/3" },
              {
                key: "startDate",
                label: "Start Date",
                width: "w-1/4",
                formatter: (value) => new Date(value).toLocaleDateString(),
              },
              {
                key: "endDate",
                label: "End Date",
                width: "w-1/4",
                formatter: (value) => new Date(value).toLocaleDateString(),
              },
              { key: "location", label: "Location", width: "w-1/6" },
            ]}
            emptyMessage="No events found."
            renderActions={(item, triggerDelete) => (
              <>
                {userRoles.includes("Admin") && (
                  <>
                    <Button
                      type="tertiary"
                      onClick={() =>
                        setModalOpen ? setModalOpen("edit") : () => {}
                      }
                      buttonText="Edit"
                      width="fit"
                    />
                    <Button
                      type="danger"
                      onClick={() => triggerDelete(item.id)}
                      buttonText="Delete"
                      width="fit"
                    />
                  </>
                )}
                <Button
                  type="secondary"
                  buttonText="Details"
                  onClick={() => {
                    navigate(`/events/${item.id}`);
                  }}
                  width="fit"
                />
              </>
            )}
          />

          {/* Mobile Card View */}
          <CardView
            items={events || []}
            titleKey="title"
            renderedFields={[
              {
                key: "startDate",
                label: "Start Date",
                formatter: (value) => new Date(value).toLocaleDateString(),
              },
              {
                key: "endDate",
                label: "End Date",
                formatter: (value) => new Date(value).toLocaleDateString(),
              },
              { key: "location", label: "Location" },
            ]}
            modalTitle="Delete Event"
            modalSubTitle="Are you sure you want to delete this event? This action cannot be undone."
            confirmationAction={handleDelete}
            isSubmitting={deleteEventMutation.isPending}
            renderButtons={(item, triggerDelete) => (
              <>
                {userRoles.includes("Admin") && (
                  <>
                    <Button
                      type="tertiary"
                      onClick={() =>
                        setModalOpen ? setModalOpen("edit") : () => {}
                      }
                      buttonIcon={<FaEdit size={16} />}
                      width="fit"
                    />
                    <Button
                      type="danger"
                      onClick={() => triggerDelete(item.id)}
                      buttonIcon={<IoTrashSharp size={17} />}
                      width="fit"
                    />
                  </>
                )}
                <Button
                  type="secondary"
                  buttonIcon={<TbListDetails size={16} />}
                  onClick={() => {
                    navigate(`/events/${item.id}`);
                  }}
                  width="fit"
                />
              </>
            )}
          />
        </>
      )}
    </div>
  );
};

export default EventList;
