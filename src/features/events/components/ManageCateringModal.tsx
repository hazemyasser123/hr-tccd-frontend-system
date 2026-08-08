import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Modal,
  InputField,
  NumberField,
  SearchField
} from "tccd-ui";
import type { CateringItem } from "@/shared/types/catering";
import { useCateringItems, useAddCateringItem, useBulkAllocateCateringItems, useBulkDeleteCateringAllocations, useDeleteCateringItem } from "@/shared/queries/catering";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { IoTrashSharp, IoAdd } from "react-icons/io5";
import toast from "react-hot-toast";
import { MdEdit } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";

interface ManageCateringModalProps {
  isOpen: boolean;
  onClose: () => void;
  cateringData?: CateringItem[];
  eventId: string;
  membersData: { id: string; name: string }[];
}

interface SelectedCateringItem extends CateringItem {
  selectedQuantity: number;
}

interface ManageCateringFormData {
    items: SelectedCateringItem[];
}

const ManageCateringModal = ({ isOpen, onClose, cateringData, eventId, membersData }: ManageCateringModalProps) => {
  const [formData, setFormData] = useState<ManageCateringFormData>({ items: [] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<{ name: string; description: string }>({
    name: "",
    description: "",
  });
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  const { data: allCateringItems, isPending: isLoadingItems } = useCateringItems();
  const addCateringItemMutation = useAddCateringItem();
  const deleteCateringItemMutation = useDeleteCateringItem();
  const bulkAllocateCateringItemsMutation = useBulkAllocateCateringItems();
  const bulkDeleteCateringAllocationsMutation = useBulkDeleteCateringAllocations();

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

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery.trim()) {
      return membersData;
    }
    const query = memberSearchQuery.toLowerCase();
    return membersData.filter(member => member.name.toLowerCase().includes(query));
  }, [membersData, memberSearchQuery]);

  // Initialize form data when modal opens or catering data changes
  useEffect(() => {
    if (isOpen) {
        if(cateringData) {
            setFormData({ items: cateringData.map(item => ({
              ...item,
              selectedQuantity: item.quantity || 1
            })) });
        } else {
            setFormData({ items: [] });
        }
        // Select all members by default
        setSelectedMemberIds(new Set(membersData.map(member => member.id)));
    }
  }, [isOpen, cateringData, membersData]);

  // Get items that are not already selected
  const availableItems = allCateringItems?.filter(
    item => !formData.items.some(selectedItem => selectedItem.id === item.id)
  ) || [];

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // If dropped outside droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same location
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Dragging from available items to selected items
    if (source.droppableId === "available-items" && destination.droppableId === "selected-items") {
      const itemId = draggableId.replace("available-item-", "");
      const itemToAdd = availableItems.find(item => item.id === itemId);
      
      if (itemToAdd) {
        setFormData(prev => ({
          items: [...prev.items, {
            ...itemToAdd,
            selectedQuantity: 1
          }]
        }));
      }
    }

    // Reordering within selected items
    if (source.droppableId === "selected-items" && destination.droppableId === "selected-items") {
      const items = Array.from(formData.items);
      const [reordeprimaryItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reordeprimaryItem);
      setFormData({
        items
      });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => ({
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const handleSelectAllMembers = () => {
    if (selectedMemberIds.size === membersData.length) {
      // Deselect all
      setSelectedMemberIds(new Set());
    } else {
      // Select all
      setSelectedMemberIds(new Set(membersData.map(member => member.id)));
    }
  };

  const handleStartEditQuantity = (itemId: string, currentQuantity: number) => {
    setEditingId(itemId);
    setEditingQuantity(currentQuantity);
  };

  const handleSaveQuantity = (itemId: string) => {
    if (editingQuantity !== null && editingQuantity > 0) {
      setFormData(prev => ({
        items: prev.items.map(item =>
          item.id === itemId
            ? { ...item, selectedQuantity: editingQuantity }
            : item
        )
      }));
    }
    setEditingId(null);
    setEditingQuantity(null);
  };

  const handleCancelEditQuantity = () => {
    setEditingId(null);
    setEditingQuantity(null);
  };

  const handleSubmit = async () => {
    if (selectedMemberIds.size === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      const initialItemIds = cateringData?.map(item => item.id) || [];
      const currentItemIds = formData.items.map(item => item.id);
      const removedItemIds = initialItemIds.filter(id => !currentItemIds.includes(id));

      if (removedItemIds.length > 0) {
        await bulkDeleteCateringAllocationsMutation.mutateAsync({
          eventId,
          memberIds: Array.from(selectedMemberIds),
          cateringItemIds: removedItemIds,
        });
      }

      await bulkAllocateCateringItemsMutation.mutateAsync({
        eventId,
        memberIds: Array.from(selectedMemberIds),
        items: formData.items.map(item => ({
          cateringItemId: item.id,
          amount: item.selectedQuantity
        }))
      });
      toast.success("Catering items allocated successfully");
      onClose();
    } catch {
      toast.error("Failed to allocate catering items, please try again");
    }
  };

  const handleClose = () => {
    setSelectedMemberIds(new Set());
    setMemberSearchQuery("");
    onClose();
  };

  const handleCreateCateringItem = async () => {
    if (!createFormData.name.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    try {
      await addCateringItemMutation.mutateAsync({
        name: createFormData.name.trim(),
        description: createFormData.description.trim(),
      });
      toast.success("Catering item created successfully");
      setCreateFormData({ name: "", description: "" });
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error("Failed to create catering item");
      console.error(error);
    }
  };

  const handleCloseCreateModal = () => {
    setCreateFormData({ name: "", description: "" });
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <Modal
        title={"Manage catering items"}
        isOpen={isOpen}
        onClose={handleClose}
        className="w-full sm:max-w-full max-w-full xl:max-w-3/4"
      >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-4 p-1">
          {/* Main containers */}
          <div className="grid grid-cols-2 gap-4 min-h-96">
            {/* Available Items */}
            <div className="flex flex-col gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Available Items</h3>
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
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
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
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-white dark:bg-surface-glass-bg rounded-xl border border-gray-200 dark:border-gray-600 cursor-move ${
                                snapshot.isDragging
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

            {/* Selected Items */}
            <div className="flex flex-col gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Selected Items</h3>
              
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
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-white dark:bg-surface-glass-bg rounded-xl border border-gray-200 dark:border-gray-600 ${
                                snapshot.isDragging
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

                                {/* Quantity Section */}
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
                                          setEditingQuantity(Math.max(1, parseInt(String(value)) || 1))
                                        }
                                      />
                                      <button
                                        onClick={() => handleSaveQuantity(item.id)}
                                        className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                                      >
                                        <FaCheck size={16} />
                                      </button>
                                      <button
                                        onClick={handleCancelEditQuantity}
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
                                          handleStartEditQuantity(item.id, item.selectedQuantity)
                                        }
                                        className="p-1 text-secondary hover:bg-secondary/10 dark:hover:bg-secondary/70 rounded"
                                        title="Edit quantity"
                                      >
                                        <MdEdit size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>

                                {/* Remove Button */}
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

          {/* Member Selection Section */}
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                Select Members {selectedMemberIds.size > 0 && <span className="text-sm font-normal text-primary ml-2">({selectedMemberIds.size} selected)</span>}
              </h3>
              <button
                onClick={handleSelectAllMembers}
                className="text-sm px-3 py-1 rounded-md text-primary cursor-pointer hover:brightness-110"
              >
                {selectedMemberIds.size === membersData.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            
            <SearchField
              placeholder="Search members..."
              value={memberSearchQuery}
              onChange={(value) => setMemberSearchQuery(value)}
              className="mb-3"
            />

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                  {memberSearchQuery ? "No members found" : "No members available"}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => handleToggleMember(member.id)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedMemberIds.has(member.id)
                        ? "bg-primary/15"
                        : "bg-white dark:bg-surface-glass-bg border border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-primary"
                    }`}
                  >
                    <p className="text-sm font-medium">{member.name}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            <Button 
              onClick={handleClose} 
              buttonText="Cancel" 
              type="secondary" 
              disabled={bulkAllocateCateringItemsMutation.isPending || bulkDeleteCateringAllocationsMutation.isPending}
              width="auto"
            />
            <Button 
              onClick={handleSubmit} 
              buttonText="Save Changes" 
              type="primary" 
              loading={bulkAllocateCateringItemsMutation.isPending || bulkDeleteCateringAllocationsMutation.isPending}
              width="auto"
            />
          </div>
        </div>
      </DragDropContext>
    </Modal>

    {/* Create Catering Item Modal */}
    <Modal
      title="Create New Catering Item"
      isOpen={isCreateModalOpen}
      onClose={handleCloseCreateModal}
    >
      <div className="flex flex-col gap-4 p-1">
        <InputField
          label="Item Name"
          id="catering-name"
          value={createFormData.name}
          placeholder="Enter item name"
          onChange={(e) =>
            setCreateFormData(prev => ({ ...prev, name: e.target.value }))
          }
        />
        <InputField
          label="Description"
          id="catering-description"
          value={createFormData.description}
          placeholder="Enter item description"
          onChange={(e) =>
            setCreateFormData(prev => ({ ...prev, description: e.target.value }))
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
            buttonText={"Create"}
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

export default ManageCateringModal;
