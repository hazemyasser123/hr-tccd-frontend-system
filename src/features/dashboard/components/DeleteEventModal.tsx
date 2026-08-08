import { TbLoader2 } from "react-icons/tb";
import type { FC } from "react";
import { Modal, Button, ButtonTypes } from "tccd-ui";

interface DeleteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

const DeleteEventModal: FC<DeleteEventModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  isLoading,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete Event">
      <div className="p-2">
        <p className="text-sm text-gray-600 mb-4 text-center">
          Are you sure you want to delete this event? This action cannot be
          undone.
        </p>
        <div className="flex justify-center gap-[4%]">
          {isLoading ? (
            <button
              className="rounded-xl px-6 py-2 border font-bold text-[12px] md:text-[13px] lg:text-[14px] transition-all duration-200 ease-in-out flex items-center justify-center h-fit bg-inactive-tab-text"
              disabled={true}
            >
              <TbLoader2 className="animate-spin" />
            </button>
          ) : (
            <>
              <Button
                buttonText="Cancel"
                onClick={onClose}
                type={ButtonTypes.SECONDARY}
              />
              <Button
                buttonText="Delete"
                onClick={onDelete}
                type={ButtonTypes.PRIMARY}
              />
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DeleteEventModal;
