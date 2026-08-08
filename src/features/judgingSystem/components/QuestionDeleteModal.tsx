import { Modal, Button } from "tccd-ui";

export default function QuestionDeleteModal({
  isOpen,
  onClose,
  handleDelete,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  handleDelete: () => void;
  isLoading: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Question">
      <p className="text-text-body-main">
        Are you sure you want to delete this question? this action cannot be
        undone.
      </p>
      <div className="flex justify-center items-center gap-2">
        <Button
          buttonText="Cancel"
          type="secondary"
          width="small"
          onClick={onClose}
        />
        <Button
          buttonText="Delete"
          type="danger"
          width="small"
          onClick={handleDelete}
          loading={isLoading}
        />
      </div>
    </Modal>
  );
}
