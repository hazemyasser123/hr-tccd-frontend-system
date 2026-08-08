import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "tccd-ui";
import { FaXmark } from "react-icons/fa6";
import toast from "react-hot-toast";
import type { CompanyCateringAllocation } from "@/shared/types/company";
import {
  useBulkAllocateCompanyCateringItems,
  useBulkDeleteCompanyCateringAllocations,
  useCompanyCateringItems,
} from "@/shared/queries/companies";

interface EditCompanyCateringModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  eventId: string;
  companyAllocations: CompanyCateringAllocation[];
}

interface AllocationFormData {
  [cateringItemId: string]: number;
}

const normalizeToNonNegativeInteger = (value: unknown): number => {
  const parsedValue =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value ?? "").trim());

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(parsedValue));
};

const EditCompanyCateringModal = ({
  isOpen,
  onClose,
  companyId,
  companyName,
  eventId,
  companyAllocations,
}: EditCompanyCateringModalProps) => {
  const [formData, setFormData] = useState<AllocationFormData>({});
  const [displayedCateringItems, setDisplayedCateringItems] = useState(
    [] as { id: string; name: string; description: string }[]
  );

  const { data: allCateringItems } = useCompanyCateringItems();
  const bulkAllocateMutation = useBulkAllocateCompanyCateringItems();
  const bulkDeleteMutation = useBulkDeleteCompanyCateringAllocations();

  const handleRemoveItem = (itemId: string) => {
    setDisplayedCateringItems((previousItems) =>
      previousItems.filter((item) => item.id !== itemId)
    );
    setFormData((previousData) => {
      const nextData = { ...previousData };
      delete nextData[itemId];
      return nextData;
    });
  };

  useEffect(() => {
    if (isOpen && allCateringItems) {
      setDisplayedCateringItems(
        allCateringItems.filter((item) =>
          companyAllocations.some(
            (allocation) => allocation.cateringItemId === item.id
          )
        )
      );
      return;
    }

    if (!isOpen) {
      setDisplayedCateringItems([]);
    }
  }, [isOpen, allCateringItems, companyAllocations]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({});
      return;
    }

    const initialData: AllocationFormData = {};
    companyAllocations.forEach((allocation) => {
      initialData[allocation.cateringItemId] = normalizeToNonNegativeInteger(
        allocation.amount
      );
    });
    setFormData(initialData);
  }, [isOpen, companyId, companyAllocations]);

  useEffect(() => {
    setFormData((previousData) => {
      let hasChanges = false;
      const normalizedData: AllocationFormData = {};

      Object.entries(previousData).forEach(([itemId, amount]) => {
        const normalizedAmount = normalizeToNonNegativeInteger(amount);
        normalizedData[itemId] = normalizedAmount;

        if (normalizedAmount !== amount) {
          hasChanges = true;
        }
      });

      return hasChanges ? normalizedData : previousData;
    });
  }, [formData]);

  const itemsToDisplay = useMemo(() => {
    return displayedCateringItems.map((item) => {
      const allocation = companyAllocations.find(
        (entry) => entry.cateringItemId === item.id
      );
      return {
        ...item,
        currentAmount: normalizeToNonNegativeInteger(allocation?.amount),
      };
    });
  }, [displayedCateringItems, companyAllocations]);

  const handleQuantityChange = (itemId: string, value: string | number) => {
    const numericValue = normalizeToNonNegativeInteger(value);

    setFormData((previousData) => ({
      ...previousData,
      [itemId]: numericValue,
    }));
  };

  const handleSubmit = async () => {
    try {
      const visibleItemIds = new Set(
        displayedCateringItems.map((item) => item.id)
      );

      const items = Object.entries(formData).reduce<
        { cateringItemId: string; amount: number }[]
      >((accumulator, [cateringItemId, rawAmount]) => {
        if (!visibleItemIds.has(cateringItemId)) {
          return accumulator;
        }

        const amount = normalizeToNonNegativeInteger(rawAmount);

        if (amount > 0) {
          accumulator.push({
            cateringItemId,
            amount,
          });
        }

        return accumulator;
      }, []);

      const initialItemIds = companyAllocations.map(
        (allocation) => allocation.cateringItemId
      );
      const currentItemIds = items.map((item) => item.cateringItemId);
      const removedItemIds = initialItemIds.filter(
        (itemId) => !currentItemIds.includes(itemId)
      );

      if (removedItemIds.length > 0) {
        await bulkDeleteMutation.mutateAsync({
          eventId,
          companyIds: [companyId],
          cateringItemIds: removedItemIds,
        });
      }

      await bulkAllocateMutation.mutateAsync({
        eventId,
        companyIds: [companyId],
        items,
      });

      toast.success(`Catering allocation for ${companyName} updated successfully`);
      onClose();
    } catch {
      toast.error("Failed to update company catering allocation");
    }
  };

  return (
    <Modal
      title={`Edit Catering for ${companyName}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 p-1 max-h-96 overflow-y-auto">
        {itemsToDisplay.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No catering items available
          </div>
        ) : (
          <div className="space-y-4">
            {itemsToDisplay.map((item) => (
              <div
                key={item.id}
                className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 relative"
              >
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                  title="Remove item"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <FaXmark size={16} />
                </button>
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
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`company-catering-quantity-${item.id}`}
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Quantity
                  </label>
                  <input
                    id={`company-catering-quantity-${item.id}`}
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={String(
                      normalizeToNonNegativeInteger(
                        formData[item.id] !== undefined
                          ? formData[item.id]
                          : item.currentAmount
                      )
                    )}
                    onChange={(event) =>
                      handleQuantityChange(item.id, event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "-" ||
                        event.key === "+" ||
                        event.key === "e" ||
                        event.key === "E"
                      ) {
                        event.preventDefault();
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-2 mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
          <Button
            onClick={onClose}
            buttonText="Cancel"
            type="secondary"
            width="auto"
          />
          <Button
            onClick={handleSubmit}
            buttonText={bulkAllocateMutation.isPending ? "Updating..." : "Update"}
            loading={bulkAllocateMutation.isPending || bulkDeleteMutation.isPending}
            type="primary"
            width="auto"
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditCompanyCateringModal;
