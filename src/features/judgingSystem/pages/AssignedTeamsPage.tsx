import WithNavbar from "@/shared/components/hoc/WithNavbar";
import TeamSelectorListing from "../components/TeamSelectorListing";
import { FaChevronLeft } from "react-icons/fa";

export default function AssignedTeamsPage() {
  return (
    <WithNavbar>
      <div className="w-[96%] md:[94%] lg:w-[84%] xl:w-[73%] mx-auto mt-6">
        <div className="flex gap-2 items-center cursor-pointer group" onClick={() => window.history.back()}>
          <FaChevronLeft
            className="size-4 cursor-pointer text-text-body-main group-hover:text-primary transition-colors duration-150"
          />
          <p className="text-md md:text-lg font-bold text-text-title group-hover:text-primary transition-colors duration-150">
            Back
          </p>
        </div>
      </div>
      <div className="bg-surface-glass-bg shadow-lg rounded-lg border-surface-glass-border/10 p-4 w-[96%] md:w-[94%] lg:w-[84%] xl:w-[73%] mx-auto border mt-3">
        <p className="text-center text-[22px] md:text-[24px] lg:text-[26px] font-bold text-text-title">
          Judge Team Assignments
        </p>
        <p className="text-center mb-4 md:mb-6 lg:text-[16px] md:text-[15px] text-[14px] text-text-muted-foreground">
          Manage teams assigned to judge for evaluation and scoring
        </p>
        <TeamSelectorListing />
      </div>
    </WithNavbar>
  );
}
