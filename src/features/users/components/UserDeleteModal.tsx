import { Button, ButtonTypes, Modal } from "tccd-ui";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/shared/utils";
import { useDeleteUser } from "@/shared/queries/users";

export default function UserDeleteModal({
  showModal,
  setShowModal,
}: {
  showModal: string;
  setShowModal: (val: string) => void;
}) {
  const deleteUserMutation = useDeleteUser();

  const handleConfirmDelete = () => {
    if (!showModal) return;
    deleteUserMutation.mutate(showModal, {
      onSuccess: () => {
        toast.success("Member deleted successfully");
        setShowModal("");
      },
      onError: (error: any) => {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      },
    });
  };

  return (
    <>
      {showModal !== "" && (
        <Modal
          title="Confirm Delete"
          isOpen={showModal !== ""}
          onClose={() => setShowModal("")}
        >
          <div className="p-4">
            <p className="mb-6 text-center dark:text-text-body-main">
              Are you sure you want to delete this member? This action cannot be
              undone.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                type={ButtonTypes.SECONDARY}
                onClick={() => setShowModal("")}
                buttonText="Cancel"
              />
              <Button
                type={ButtonTypes.DANGER}
                onClick={handleConfirmDelete}
                loading={deleteUserMutation.isPending}
                buttonText="Delete"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
