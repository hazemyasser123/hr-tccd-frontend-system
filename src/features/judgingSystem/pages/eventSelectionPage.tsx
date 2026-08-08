import WithNavbar from "@/shared/components/hoc/WithNavbar";
import { useAllEvents } from "@/shared/queries/events";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { SearchField, Button } from "tccd-ui";
import type { Event } from "@/shared/types/event";
import { format } from "@/shared/utils";
import ConditionalWrapper from "@/shared/utils/conditionalWrapper";
import { useSelector } from "react-redux";
import logo from "@/assets/TCCD_logo.svg";

export default function EventSelectionPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const userRoles = useSelector((state: any) => state.auth.user?.roles || []);
  const isJudge = userRoles.includes("Judge") && userRoles.length === 1;
  const isAdmin = userRoles.includes("Admin");

  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState(eventSearchTerm);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(eventSearchTerm), 300);
    return () => clearTimeout(t);
  }, [eventSearchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const eventStatuses = isAdmin
    ? ["Upcoming", "Running", "Past"]
    : ["Upcoming", "Running"];

  const { data, isLoading } = useAllEvents(
    currentPage,
    10,
    "ResearchDay",
    debouncedSearchTerm,
    eventStatuses,
  );
  const events = data?.items ?? [];
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  const children = (
    <div className="p-4 w-[94%] md:w-[90%] lg:w-[80%] xl:w-[70%] mx-auto text-text-body-main">
      <p className="lg:text-[26px] md:text-[24px] text-[22px] font-bold text-center mb-2 text-text-title">
        Welcome to our Judging System
      </p>
      <p className="mb-6 lg:text-[18px] md:text-[15px] text-[14px] font-semibold text-center text-text-muted-foreground">
        Please select the event you wish to evaluate or manage the teams of
      </p>
      <div className="w-full rounded-lg shadow-lg md:p-4 p-2 bg-surface-glass-bg">
        <SearchField
          className="lg:w-48"
          placeholder="Search event name..."
          value={eventSearchTerm}
          onChange={(value) => setEventSearchTerm(value)}
        />
        <div className="max-h-[60vh] mt-4 overflow-x-auto">
          {isLoading ? (
            <p className="text-center text-text-muted-foreground mt-10">
              Loading events...
            </p>
          ) : events?.length === 0 ? (
            <p className="text-center text-text-muted-foreground mt-10">
              No events found.
            </p>
          ) : (
            <>
              <table className="w-full text-left border-surface-glass-border/10 rounded-xl border">
                <thead className="bg-surface-glass-border/5 border-b border-surface-glass-border/10 rounded-t-xl">
                  <tr>
                    <th className="px-3 py-2 text-sm font-semibold text-text-muted-foreground">
                      Name
                    </th>
                    <th className="px-3 py-2 text-sm font-semibold text-text-muted-foreground">
                      Start Date
                    </th>
                    <th className="px-3 py-2 text-sm font-semibold text-text-muted-foreground">
                      End Date
                    </th>
                    <th className="px-3 py-2 text-sm font-semibold text-text-muted-foreground">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-glass-border/10">
                  {events?.map((event: Event) => (
                    <tr
                      key={event.id}
                      className={`h-12 md:h-16 text-[13px] md:text-[14px] lg:text-[16px] whitespace-nowrap rounded-lg cursor-pointer ${
                        selectedEvent === event.id
                          ? "bg-surface-glass-border/10"
                          : "hover:bg-surface-glass-border/5"
                      }`}
                      onClick={() => setSelectedEvent(event.id)}
                    >
                      <td className="px-3 py-2 text-text-body-main">
                        {event.title}
                      </td>
                      <td className="px-3 py-2">
                        {format(event.startDate, "full")}
                      </td>
                      <td className="px-3 py-2">
                        {format(event.endDate, "full")}
                      </td>
                      <td className="px-3 py-2">{event.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
        <div className="flex justify-center items-center gap-3 mt-4">
          <FaChevronLeft
            className={`cursor-pointer size-4 ${
              currentPage === 1
                ? "text-text-muted-foreground/50 cursor-not-allowed"
                : "text-text-title hover:text-primary"
            }`}
            onClick={() => {
              if (currentPage > 1 && !isLoading) {
                setCurrentPage(currentPage - 1);
              }
            }}
          />
          <span className="text-[14px] md:text-[15px] lg:text-[16px] font-medium text-text-body-main">
            Page {currentPage}
          </span>
          <FaChevronRight
            className={`cursor-pointer size-4 ${
              events && events.length < 10
                ? "text-text-muted-foreground/50 cursor-not-allowed"
                : "text-text-title hover:text-primary"
            }`}
            onClick={() => {
              if (events && events.length === 10 && !isLoading) {
                setCurrentPage(currentPage + 1);
              }
            }}
          />
        </div>
        <div className="mt-3 md:mt-5 mb-2 flex justify-center items-center gap-3">
          <Button
            type="primary"
            onClick={() => {
              if (selectedEvent)
                window.location.href = `/judging-system/teams/${selectedEvent}`;
            }}
            buttonText="Confirm"
            disabled={!selectedEvent}
          />
        </div>
      </div>
    </div>
  );

  return (
    <ConditionalWrapper
      condition={!isJudge}
      wrapper={(children) => <WithNavbar>{children}</WithNavbar>}
    >
      <main className="min-h-screen bg-gradient-to-b from-page-gradient-start via-page-gradient-middle to-page-gradient-end text-text-body-main">
        <img
          src={logo}
          alt="TCCD Logo"
          className="w-24 md:w-28 h-auto mx-auto pt-6"
        />
        {children}
      </main>
    </ConditionalWrapper>
  );
}
