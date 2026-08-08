import { Button, ButtonTypes, ButtonWidths } from "tccd-ui";

interface VestActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    attendeeName: string;
    isSubmitting: boolean;
    action: "assign" | "return";
}

const VestActionModal = ({ isOpen, onClose, onConfirm, attendeeName, isSubmitting, action }: VestActionModalProps) => {
    if (!isOpen) return null;

    const actionText = action === "assign" ? "assign vest to" : "return vest from";
    const actionTitle = action === "assign" ? "Assign Vest" : "Return Vest";

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {actionTitle}
                </h3>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to {actionText} <strong>{attendeeName}</strong>?
                </p>
                <div className="flex justify-end space-x-3">
                    {isSubmitting ? ( <div className="mt-0">
                        <Button
                            buttonText="Submitting..."
                            onClick={() => {}}
                            type={ButtonTypes.PRIMARY}
                            disabled={true}
                        />
                    </div> ) : (
                        <>
                        <div className="mt-0">
                            <Button
                                buttonText="Cancel"
                                onClick={onClose}
                                type={ButtonTypes.GHOST}
                                width={ButtonWidths.AUTO}
                            />
                        </div>
                        <div className="mt-0">
                            <Button
                                buttonText="Confirm"
                                onClick={() => onConfirm()}
                                type={ButtonTypes.PRIMARY}
                                width={ButtonWidths.AUTO}
                            />
                        </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VestActionModal;