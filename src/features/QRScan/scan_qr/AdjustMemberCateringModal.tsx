import { useState, useEffect } from "react";
import { Modal, NumberField, Button } from "tccd-ui";
import type { CateringItem } from "@/shared/types/catering";
import {
  useConsumeCateringItems,
  useEventCateringItems,
} from "@/shared/queries/catering";
import toast from "react-hot-toast";

interface AdjustMemberCateringModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  eventId: string;
}

const AdjustMemberCateringModal = ({
  isOpen,
  onClose,
  memberId,
  memberName,
  eventId,
}: AdjustMemberCateringModalProps) => {
  const consumeCateringMutation = useConsumeCateringItems();
  const { data: fetchedAllocations, isLoading: isFetchingAllocations } = useEventCateringItems(eventId, memberId, isOpen);

  const memberAllocations = fetchedAllocations || [];

  const [displayedCateringItems, setDisplayedCateringItems] = useState<
    (CateringItem & { remainingAmount: number })[]
  >([]);

  
  useEffect(() => {
    if (isOpen && memberAllocations.length > 0) {
        const initialData = memberAllocations.map((allocation) => {
          return {
            id: allocation.cateringItemId,
            name: allocation.itemName || "Unknown Item",
            description: "", // Removed fallback via allCateringItems
            quantity: 0,
            remainingAmount: allocation.remainingAmount || 0,
          };
        }
        );
        setDisplayedCateringItems(initialData);
    }
  }, [isOpen, memberId, memberAllocations]);

  const handleQuantityChange = (itemId: string, value: string | number) => {
    const item = displayedCateringItems.find(i => i.id === itemId);
    const maxVal = item?.remainingAmount || 0;
    
    // Safely parse the value
    let numValue = parseInt(String(value));
    if (isNaN(numValue)) numValue = 0;
    
    // Enforce limits immediately
    if (numValue > maxVal) numValue = maxVal;
    if (numValue < 0) numValue = 0;

    setDisplayedCateringItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: numValue } : item,
      ),
    );
  };

  const handleSubmit = async () => {
    try {
      const items = displayedCateringItems.map((item) => ({
        cateringItemId: item.id,
        quantity: item.quantity || 0,
      })).filter((item) => item.quantity > 0);

      await consumeCateringMutation.mutateAsync({
        eventId,
        memberId,
        items,
      });

      toast.success(
        `Catering allocation for ${memberName} updated successfully`,
      );
      onClose();
    } catch (error) {
      toast.error("Failed to update catering allocation");
      console.error(error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      title={`Check off Catering items for ${memberName}`}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div className="flex flex-col gap-4 p-1 max-h-96 overflow-y-auto">
        {isFetchingAllocations ? (
          <div className="text-center text-gray-500 py-8">
            Loading allocations...
          </div>
        ) : memberAllocations.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No catering items available
          </div>
        ) : (
          <div className="space-y-4">
            {displayedCateringItems.map((item) => (
              <div
                key={item.id}
                className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 relative"
              >
                <div className="flex flex-col gap-2 mb-3">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">
                    {item.name}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  )}
                </div>
                <NumberField
                  id={`quantity-${item.id}`}
                  label={`Quantity (Max: ${item.remainingAmount})`}
                  min={0}
                  max={item.remainingAmount}
                  value={String(
                    displayedCateringItems.find((i) => i.id === item.id)
                      ?.quantity || 0,
                  )}
                  onChange={(value) => handleQuantityChange(item.id, value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-2 mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
          <Button
            onClick={handleClose}
            buttonText="Cancel"
            type="secondary"
            width="auto"
          />
          <Button
            onClick={handleSubmit}
            buttonText={
              consumeCateringMutation.isPending ? "Updating..." : "Update"
            }
            type="primary"
            width="auto"
          />
        </div>
      </div>
    </Modal>
  );
};

export default AdjustMemberCateringModal;
