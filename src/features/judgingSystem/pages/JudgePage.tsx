import { Button } from "tccd-ui";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import type { Event } from "@/shared/types/event";
import JudgesList from "../components/JudgesList";
import ManageJudgeModal from "../components/ManageJudgeModal";

export default function JudgesPage({ event }: { event: Event | undefined }) {
  const [modalOpen, setModalOpen] = useState<number>(0);

  return (
    <>
      <ManageJudgeModal
        isOpen={modalOpen !== 0}
        onClose={() => setModalOpen(0)}
      />
      <div className="w-full space-y-3">
        <div className="flex justify-between items-center gap-5">
          <h1 className="lg:text-[22px] md:text-[20px] text-[18px] font-bold mb-0 text-text-title">
            {event?.title}'s Judges
          </h1>
          <Button
            buttonText="New Judge"
            onClick={() => setModalOpen(1)}
            type="primary"
            width="auto"
            buttonIcon={<FaPlus />}
          />
        </div>
        <JudgesList />
      </div>
    </>
  );
}
