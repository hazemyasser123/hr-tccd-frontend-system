import { useFinalizeTeamScores } from "@/shared/queries/judgingSystem/judgeQueries";
import { getEventQuestions } from "@/shared/queries/judgingSystem/judgeAPI";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmActionModal from "./ConfirmActionModal";

interface FinalizeScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  judgeId: string;
  department: string;
}

export default function FinalizeScoresModal({
  isOpen,
  onClose,
  judgeId,
  department,
}: FinalizeScoresModalProps) {
  const { eventId } = useParams();
  const finalizeMutation = useFinalizeTeamScores();

  const handleSubmit = async () => {
    if (!eventId) return;
    const toastId = toast.loading("Finalizing scores...");
    try {
      const questionData = await getEventQuestions(
        eventId,
      );

      const maxScore = questionData.length * 10;
      await finalizeMutation.mutateAsync({
            eventId,
            department,
            judgeId,
            maxScore,
          });
      toast.success("Scores finalized successfully!", { id: toastId });
      onClose();
    } catch {
      toast.error("Failed to finalize scores. Please try again.", {
        id: toastId,
      });
    }
  };

  return (
    <ConfirmActionModal
      item={undefined}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={finalizeMutation.isPending}
      title="Confirm to Finalize Scores"
      subtitle={`Are you sure you want to finalize the scores for ${department} department?`}
      buttonText="Finalize"
      buttonType="primary"
    />
  );
}
