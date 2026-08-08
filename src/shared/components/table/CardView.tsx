import { useEffect, useState } from "react";
import ConfirmActionModal from "@/features/judgingSystem/components/ConfirmActionModal";

interface CardViewProps<T> {
  items: T[];
  titleKey: keyof T;
  renderedFields: {
    label: string;
    key: keyof T;
    formatter?: (value: any, item?: T) => any;
    fullWidth?: boolean;
  }[];
  modalTitle?: string;
  modalSubTitle?: string;
  isSubmitting?: boolean;
  confirmationAction?: (item: T) => void;
  renderButtons?: (
    item: T,
    triggerDelete: (id: string) => void,
    index: number,
    setItem: (item: T) => void
  ) => React.ReactNode;
  emptyMessage?: string;
}

const CardView = <T extends { id?: string }>({
  items,
  titleKey,
  renderedFields,
  modalTitle = "",
  modalSubTitle = "",
  confirmationAction,
  isSubmitting = false,
  renderButtons,
  emptyMessage = "No items found",
}: CardViewProps<T>) => {
  const [showDeleteModal, setShowDeleteModal] = useState("");
  const [displayedItems, setDisplayedItems] = useState<T[]>(items);
  const [, setSelectedItem] = useState<T | null>(null);

  useEffect(() => {
    setDisplayedItems(items);
  }, [items]);

  return (
    <div className="lg:hidden divide-y divide-surface-glass-border/10">
      {modalTitle && confirmationAction && (
        <ConfirmActionModal
          item={items.find((item) => item.id === showDeleteModal) as T}
          title={modalTitle}
          subtitle={modalSubTitle}
          isOpen={!!showDeleteModal}
          onClose={() => setShowDeleteModal("")}
          onSubmit={(target: T) => {
            confirmationAction(target);
            setShowDeleteModal("");
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {displayedItems && displayedItems.length > 0 ? (
        displayedItems.map((item, index) => (
          <div key={item.id || index} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-text-title text-[18px] md:text-[20px]">
                  {String(item[titleKey]) || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm mt-4">
              {renderedFields.map((field, idx) => {
                const value = item[field.key];
                const displayValue = field.formatter
                  ? field.formatter(value, item)
                  : String(value || "N/A");

                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${field.fullWidth ? "w-full" : "min-w-32 flex-1"}`}
                  >
                    <p className="font-medium text-text-muted-foreground text-xs mb-0.5">
                      {field.label}
                    </p>
                    <p className="text-text-body-main break-words whitespace-normal leading-relaxed" title={String(displayValue)}>{displayValue}</p>
                  </div>
                );
              })}
            </div>

            {renderButtons && (
              <div className="mt-4 pt-3 border-t border-surface-glass-border/10 flex justify-center items-center gap-2">
                {renderButtons(
                  item,
                  (id: string) => setShowDeleteModal(id),
                  index,
                  (item: T) => setSelectedItem(item)
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="p-8 text-center">
          <div className="text-dashboard-description">
            <p className="text-lg font-medium">{emptyMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardView;
