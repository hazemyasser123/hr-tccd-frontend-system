import TeamList from "@/features/judgingSystem/components/TeamList";
import { Button } from "tccd-ui";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import ManageTeamModal from "../components/ManageTeamModal";
import type { Team } from "@/shared/types/judgingSystem";
import type { Event } from "@/shared/types/event";
import LogoutModal from "@/shared/components/navbar/LogoutModal";

export default function TeamsPage({
  event,
  mode,
}: {
  event: Event | undefined;
  mode: boolean;
}) {
  const { eventId } = useParams();
  const [modalOpen, setModalOpen] = useState<number>(0);
  const [selectedTeamData, setSelectedTeamData] = useState<Team | undefined>(
    undefined
  );
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const handleOpenCreateModal = () => {
    setSelectedTeamData(undefined);
    setModalOpen(1);
  };

  const handleOpenEditModal = (teamData: Team) => {
    setSelectedTeamData(teamData);
    setModalOpen(2);
  };

  return (
    <>
      <LogoutModal
        showLogoutModal={isLogoutModalOpen}
        setShowLogoutModal={() => setIsLogoutModalOpen(false)}
      />
      <ManageTeamModal
        isOpen={modalOpen !== 0}
        onClose={() => setModalOpen(0)}
        mode={modalOpen}
        eventId={eventId!}
        teamData={selectedTeamData}
      />
      <div className="w-full space-y-3">
        <div className="flex justify-between items-center gap-5">
          <h1 className="lg:text-[22px] md:text-[20px] text-[18px] font-bold mb-0 text-text-title">
            {event?.title}'s Teams
          </h1>
          {!mode && (
            <Button
              buttonText="Log out"
              onClick={() => setIsLogoutModalOpen(true)}
              type="basic"
              width="auto"
              buttonIcon={<BiLogOut className="size-4" />}
            />
          )}
          {mode && (
            <Button
              buttonText="New Team"
              onClick={handleOpenCreateModal}
              type="primary"
              width="auto"
              buttonIcon={<FaPlus />}
            />
          )}
        </div>
        <TeamList setModalOpen={handleOpenEditModal} />
      </div>
    </>
  );
}
