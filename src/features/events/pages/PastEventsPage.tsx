import WithNavbar from "@/shared/components/hoc/WithNavbar";
import { EventModal } from "@/features/events/components";
import { useState } from "react";
import EventList from "../components/EventList";
import { FaPlus } from "react-icons/fa";
import { Button } from "tccd-ui";

const PastEventsPage = () => {
  const [modalOpen, setModalOpen] = useState("");

  return (
    <WithNavbar>
      <EventModal
        isOpen={modalOpen !== ""}
        onClose={() => setModalOpen("")}
        event={null}
        mode={modalOpen as "create" | "edit"}
      />
      <div className="min-h-screen bg-background p-4 text-text-body-main">
        <div className="w-[96%] md:w-[94%] lg:w-[84%] xl:w-[73%] mx-auto">
          <h1 className="lg:text-[24px] md:text-[22px] text-[20px] font-bold">
            Past Events
          </h1>
          <p className="mb-2 lg:text-[16px] md:text-[14px] text-[13px] text-inactive-tab-text">
            View and manage all past events.
          </p>
          <div className="w-full my-4">
            <Button
              buttonText="New Event"
              onClick={() => setModalOpen("create")}
              type="primary"
              width="auto"
              buttonIcon={<FaPlus />}
            />
          </div>
          <EventList
            fetchedEventStatuses={["Past"]}
            setModalOpen={setModalOpen}
          />
        </div>
      </div>
    </WithNavbar>
  );
};

export default PastEventsPage;
