import { useEffect, useMemo, useState } from "react";
import {
  Button,
  InputField,
  Modal,
  NumberField,
  SearchField,
} from "tccd-ui";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { IoAdd, IoTrashSharp } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import toast from "react-hot-toast";
import type { CateringItem } from "@/shared/types/catering";
import {
  useAddCompanyCateringItem,
  useBulkAllocateCompanyCateringItems,
  useBulkDeleteCompanyCateringAllocations,
  useCompanyCateringItems,
} from "@/shared/queries/companies";
import { useDeleteCateringItem } from "@/shared/queries/catering";

interface ManageCompanyCateringModalProps {
  isOpen: boolean;
  onClose: () => void;
  cateringData?: CateringItem[];
  eventId: string;
  companiesData: { id: string; name: string }[];
}

interface SelectedCateringItem extends CateringItem {
  selectedQuantity: number;
}

interface ManageCompanyFormData {
  items: SelectedCateringItem[];
}

const ManageCompanyCateringModal = ({
  isOpen,
  onClose,
  cateringData,
  eventId,
  companiesData,
}: ManageCompanyCateringModalProps) => {
  const [formData, setFormData] = useState<ManageCompanyFormData>({ items: [] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(
    new Set()
  );
  const [companySearchQuery, setCompanySearchQuery] = useState("");

  const { data: allCateringItems, isPending: isLoadingItems } =
    useCompanyCateringItems();
  const addCateringItemMutation = useAddCompanyCateringItem();
  const deleteCateringItemMutation = useDeleteCateringItem();
  const bulkAllocateMutation = useBulkAllocateCompanyCateringItems();
  const bulkDeleteMutation = useBulkDeleteCompanyCateringAllocations();

  const handleDeleteItem = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to permanently delete this catering item?")) {
      try {
        await deleteCateringItemMutation.mutateAsync(itemId);
        toast.success("Item deleted successfully");
        setFormData(prev => ({
          items: prev.items.filter(item => item.id !== itemId)
        }));
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete item");
      }
    }
  };

  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery.trim()) {
      return companiesData;
    }

    const query = companySearchQuery.toLowerCase();
    return companiesData.filter((company) =>
      company.name.toLowerCase().includes(query)
    );
  }, [companiesData, companySearchQuery]);

  useEffect(() => {
    if (isOpen) {
      if (cateringData) {
        setFormData({
          items: cateringData.map((item) => ({
            ...item,
            selectedQuantity: item.quantity || 1,
          })),
        });
      } else {
        setFormData({ items: [] });
      }

      setSelectedCompanyIds(new Set(companiesData.map((company) => company.id)));
    }
  }, [isOpen, cateringData, companiesData]);

  const availableItems =
    allCateringItems?.filter(
      (item) => !formData.items.some((selectedItem) => selectedItem.id === item.id)
    ) || [];

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (
      source.droppableId === "available-items" &&
      destination.droppableId === "selected-items"
    ) {
      const itemId = draggableId.replace("available-item-", "");
      const itemToAdd = availableItems.find((item) => item.id === itemId);

      if (itemToAdd) {
        setFormData((previousData) => ({
          items: [...previousData.items, { ...itemToAdd, selectedQuantity: 1 }],
        }));
      }
    }

    if (
      source.droppableId === "selected-items" &&
      destination.droppableId === "selected-items"
    ) {
      const items = Array.from(formData.items);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setFormData({ items });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (editingId === itemId) {
      setEditingId(null);
      setEditingQuantity(null);
    }

    setFormData((previousData) => ({
      items: previousData.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleToggleCompany = (companyId: string) => {
    setSelectedCompanyIds((previousSet) => {
      const nextSet = new Set(previousSet);
      if (nextSet.has(companyId)) {
        nextSet.delete(companyId);
      } else {
        nextSet.add(companyId);
      }
      return nextSet;
    });
  };

  const handleSelectAllCompanies = () => {
    if (selectedCompanyIds.size === companiesData.length) {
      setSelectedCompanyIds(new Set());
      return;
    }

    setSelectedCompanyIds(new Set(companiesData.map((company) => company.id)));
  };

  const handleStartEditQuantity = (itemId: string, currentQuantity: number) => {
    setEditingId(itemId);
    setEditingQuantity(currentQuantity);
  };

  const handleSaveQuantity = (itemId: string) => {
    if (editingQuantity !== null && editingQuantity > 0) {
      setFormData((previousData) => ({
        items: previousData.items.map((item) =>
          item.id === itemId
            ? { ...item, selectedQuantity: editingQuantity }
            : item
        ),
      }));
    }

    setEditingId(null);
    setEditingQuantity(null);
  };

  const handleSubmit = async () => {
    if (selectedCompanyIds.size === 0) {
      toast.error("Please select at least one company");
      return;
    }

    try {
      const initialItemIds = cateringData?.map((item) => item.id) || [];
      const currentItemIds = formData.items.map((item) => item.id);
      const removedItemIds = initialItemIds.filter(
        (id) => !currentItemIds.includes(id)
      );

      if (removedItemIds.length > 0) {
        await bulkDeleteMutation.mutateAsync({
          eventId,
          companyIds: Array.from(selectedCompanyIds),
          cateringItemIds: removedItemIds,
        });
      }

      await bulkAllocateMutation.mutateAsync({
        eventId,
        companyIds: Array.from(selectedCompanyIds),
        items: formData.items.map((item) => ({
          cateringItemId: item.id,
          amount: item.selectedQuantity,
        })),
      });

      toast.success("Company catering allocations updated successfully");
      onClose();
    } catch {
      toast.error("Failed to update company catering allocations");
    }
  };

  const handleClose = () => {
    setSelectedCompanyIds(new Set());
    setCompanySearchQuery("");
    onClose();
  };

  const handleCreateCateringItem = async () => {
    const trimmedName = createFormData.name.trim();
    if (!trimmedName) {
      toast.error("Please enter an item name");
      return;
    }

    try {
      await addCateringItemMutation.mutateAsync({
        name: trimmedName,
        description: createFormData.description.trim(),
      });
      toast.success("Item created successfully");
      setCreateFormData({ name: "", description: "" });
      setIsCreateModalOpen(false);
    } catch {
      toast.error("Failed to create item");
    }
  };

  const handleCloseCreateModal = () => {
    setCreateFormData({ name: "", description: "" });
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <Modal
        title="Manage company catering"
        isOpen={isOpen}
        onClose={handleClose}
        className="xl:max-w-3/4"
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-col gap-4 p-1">
            <div className="grid grid-cols-2 gap-4 min-h-96">
              <div className="flex flex-col gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                    Available Items
                  </h3>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-full cursor-pointer"
                    title="Create new item"
                  >
                    <IoAdd size={20} />
                  </button>
                </div>

                {isLoadingItems ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
                  </div>
                ) : availableItems.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <p className="text-center text-sm">
                      All items have been selected or no items available
                    </p>
                  </div>
                ) : (
                  <Droppable droppableId="available-items">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 pb-2 ${
                          snapshot.isDraggingOver
                            ? "bg-seconadry-100 dark:bg-seconadry-900 rounded"
                            : ""
                        }`}
                      >
                        {availableItems.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={`available-item-${item.id}`}
                            index={index}
                          >
                            {(providedDraggable, snapshotDraggable) => (
                              <div
                                ref={providedDraggable.innerRef}
                                {...providedDraggable.draggableProps}
                                {...providedDraggable.dragHandleProps}
                                className={`p-3 bg-white dark:bg-surface-glass-bg rounded-xl border border-gray-200 dark:border-gray-600 cursor-move ${
                                  snapshotDraggable.isDragging
                                    ? "shadow-lg bg-seconadry-50 dark:bg-seconadry-900"
                                    : ""
                                }`}
                              >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                                      <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">
                                        {item.name}
                                      </p>
                                      {item.description && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      onClick={(e) => handleDeleteItem(item.id, e)}
                                      className="p-1.5 text-primary hover:bg-primary/10 dark:hover:bg-primary/70 rounded cursor-pointer"
                                      title="Delete item"
                                    >
                                      <IoTrashSharp size={16} />
                                    </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>

              <div className="flex flex-col gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                  Selected Items
                </h3>

                <Droppable droppableId="selected-items">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 pb-2 min-h-64 ${
                        snapshot.isDraggingOver
                          ? "bg-green-100 dark:bg-green-900 rounded"
                          : ""
                      }`}
                    >
                      {formData.items.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                          <p className="text-center text-sm">
                            Drag items here to select them
                          </p>
                        </div>
                      ) : (
                        <>
                          {formData.items.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={`selected-item-${item.id}`}
                              index={index}
                            >
                              {(providedDraggable, snapshotDraggable) => (
                                <div
                                  ref={providedDraggable.innerRef}
                                  {...providedDraggable.draggableProps}
                                  {...providedDraggable.dragHandleProps}
                                  className={`p-3 bg-white dark:bg-surface-glass-bg rounded-xl border border-gray-200 dark:border-gray-600 ${
                                    snapshotDraggable.isDragging
                                      ? "shadow-lg bg-green-50 dark:bg-green-900"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                                      <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">
                                        {item.name}
                                      </p>
                                      {item.description && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1 whitespace-nowrap">
                                      {editingId === item.id ? (
                                        <div className="flex items-center gap-1">
                                          <NumberField
                                            id={`quantity-${item.id}`}
                                            className="w-20"
                                            labelClassName="hidden"
                                            label=""
                                            placeholder="1"
                                            value={String(editingQuantity ?? 1)}
                                            onChange={(value) =>
                                              setEditingQuantity(
                                                Math.max(
                                                  1,
                                                  parseInt(String(value), 10) || 1
                                                )
                                              )
                                            }
                                          />
                                          <button
                                            onClick={() => handleSaveQuantity(item.id)}
                                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                                          >
                                            <FaCheck size={16} />
                                          </button>
                                          <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="p-1 text-primary hover:bg-primary/10 dark:hover:bg-primary/70 rounded"
                                          >
                                            <FaXmark size={16} />
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-center">
                                            {item.selectedQuantity}
                                          </span>
                                          <button
                                            onClick={() =>
                                              handleStartEditQuantity(
                                                item.id,
                                                item.selectedQuantity
                                              )
                                            }
                                            className="p-1 text-secondary hover:bg-secondary/10 dark:hover:bg-secondary/70 rounded"
                                            title="Edit quantity"
                                          >
                                            <MdEdit size={16} />
                                          </button>
                                        </>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="p-1 text-primary hover:bg-primary/10 dark:hover:bg-primary/70 rounded"
                                      title="Remove item"
                                    >
                                      <IoTrashSharp size={16} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>

            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                  Select Companies
                  {selectedCompanyIds.size > 0 && (
                    <span className="text-sm font-normal text-primary ml-2">
                      ({selectedCompanyIds.size} selected)
                    </span>
                  )}
                </h3>
                <button
                  onClick={handleSelectAllCompanies}
                  className="text-sm px-3 py-1 rounded-md text-primary cursor-pointer hover:brightness-110"
                >
                  {selectedCompanyIds.size === companiesData.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <SearchField
                placeholder="Search companies..."
                value={companySearchQuery}
                onChange={(value) => setCompanySearchQuery(value)}
                className="mb-3"
              />

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredCompanies.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                    {companySearchQuery ? "No companies found" : "No companies available"}
                  </div>
                ) : (
                  filteredCompanies.map((company) => (
                    <div
                      key={company.id}
                      onClick={() => handleToggleCompany(company.id)}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedCompanyIds.has(company.id)
                          ? "bg-primary/15"
                          : "bg-white dark:bg-surface-glass-bg border border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-primary"
                      }`}
                    >
                      <p className="text-sm font-medium">{company.name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              <Button
                onClick={handleClose}
                buttonText="Cancel"
                type="secondary"
                disabled={bulkAllocateMutation.isPending || bulkDeleteMutation.isPending}
                width="auto"
              />
              <Button
                onClick={handleSubmit}
                buttonText="Save Changes"
                type="primary"
                loading={bulkAllocateMutation.isPending || bulkDeleteMutation.isPending}
                width="auto"
              />
            </div>
          </div>
        </DragDropContext>
      </Modal>

      <Modal
        title="Create New Catering Item"
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      >
        <div className="flex flex-col gap-4 p-1">
          <InputField
            label="Item Name"
            id="company-catering-name"
            value={createFormData.name}
            placeholder="Enter item name"
            onChange={(event) =>
              setCreateFormData((previousData) => ({
                ...previousData,
                name: event.target.value,
              }))
            }
          />
          <InputField
            label="Description"
            id="company-catering-description"
            value={createFormData.description}
            placeholder="Enter item description"
            onChange={(event) =>
              setCreateFormData((previousData) => ({
                ...previousData,
                description: event.target.value,
              }))
            }
          />

          <div className="flex justify-center gap-2 mt-4">
            <Button
              onClick={handleCloseCreateModal}
              buttonText="Cancel"
              type="secondary"
              disabled={addCateringItemMutation.isPending}
              width="auto"
            />
            <Button
              onClick={handleCreateCateringItem}
              buttonText="Create"
              loading={addCateringItemMutation.isPending}
              type="primary"
              width="auto"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ManageCompanyCateringModal;
