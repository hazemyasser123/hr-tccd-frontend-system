import { useEffect, useState } from "react";
import {
  WelcomeCard,
  ActionCards,
  Pagination,
  EventsList,
} from "../components";
import WithNavbar from "@/shared/components/hoc/WithNavbar";
import { useAllEvents } from "@/shared/queries/events/eventQueries";
import { BiLoaderAlt } from "react-icons/bi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store/store";

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.roles || [];
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 4;

  const { data, isLoading, error, isError } = useAllEvents(
    currentPage,
    eventsPerPage,
    "",
    "",
    ["Upcoming", "Running"]
  );
  const upcomingEvents = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  useEffect(() => {
    if (isError && error) {
      toast.error(`Failed to fetch upcoming events, please try again`);
    }
  }, [isError, error]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <WithNavbar>
        <div className="xl:w-2/3 lg:w-3/4 md:w-[82%] sm:w-[92%] w-full mx-auto flex flex-col md:items-center gap-3 rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.1)] text-text-body-main">
          <WelcomeCard />
          <ActionCards />

          {isLoading ? (
            <div className="flex justify-center items-center w-full flex-col mt-10">
              <BiLoaderAlt className="animate-spin inline-block text-[26px] text-secondary" />
              <p className="text-inactive-tab-text text-center w-full text-[16px] md:text-[18px] lg:text-[20px]">
                Loading events...
              </p>
            </div>
          ) : (
            <div className="w-full space-y-4 md:space-y-5 lg:space-y-6 md:block pb-5 px-3">
              <div className="-mt-3 md:-mt-4 lg:mt-5">
                {upcomingEvents.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    title="Upcoming Events"
                  />
                )}
                <EventsList events={upcomingEvents} userRole={userRole} />
              </div>
            </div>
          )}
        </div>
    </WithNavbar>
  );
};

export default Dashboard;
