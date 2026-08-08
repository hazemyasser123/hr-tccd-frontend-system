import type { Event } from "@/shared/types/event";
import QuestionList from "../components/QuestionList";

export default function QUestionManagePage({
  event,
}: {
  event: Event | undefined;
}) {
  return (
    <>
      <div className="w-full space-y-3">
        <h1 className="lg:text-[22px] md:text-[20px] text-[18px] font-bold text-text-title">
          {event?.title}'s Criterion
        </h1>
        <QuestionList event={event} />
      </div>
    </>
  );
}
