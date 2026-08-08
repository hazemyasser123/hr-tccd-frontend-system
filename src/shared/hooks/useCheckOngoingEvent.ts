import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useOngoingEvent } from "@/shared/queries/events";
import toast from "react-hot-toast";

export default function useCheckOngoingEvent() {
  const navigate = useNavigate();
  const toDate = useMemo(() => new Date().toISOString(), []);
  const { data: ongoingEvent } = useOngoingEvent(toDate);

  const checkAndNavigate = () => {
    if (ongoingEvent) {
      navigate(`/events/scanqr/${ongoingEvent.id}`);
    } else {
      toast.error("No ongoing event found.");
    }
  };

  return checkAndNavigate;
}
