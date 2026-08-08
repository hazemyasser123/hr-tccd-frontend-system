import type { Team } from "@/shared/types/judgingSystem";

export default function TeamCard({ team }: { team: Team }) {
  return (
    <div className="bg-surface-glass-bg rounded-xl shadow-md p-5 flex flex-col h-full relative justify-between gap-4">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-text-title text-[20px] md:text-[22px] lg:text-[24px]">
            {team.name}
          </h3>
        </div>
      </div>
    </div>
  );
}
