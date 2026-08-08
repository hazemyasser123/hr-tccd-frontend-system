import type { AllocatedCateringItem } from "@/shared/types/catering";
import { useEffect, useMemo, useState } from "react";
import { SearchField, Button } from "tccd-ui";
import Table from "@/shared/components/table/Table";
import CardView from "@/shared/components/table/CardView";
import EditMemberCateringModal from "./EditMemberCateringModal";

interface CateringDistributionListProps {
  cateringData: AllocatedCateringItem[];
  eventId: string;
}

interface CateringDistributionRow {
  id: string; // Required by Table component (set to memberId)
  memberId: string;
  memberName: string;
  [itemId: string]: string | number; // "{amount}:{remainingAmount}" format
}

const CateringDistributionList = ({
  cateringData,
  eventId,
}: CateringDistributionListProps) => {
  const [searchKey, setSearchKey] = useState<string>("");
  const [displayedRows, setDisplayedRows] = useState<CateringDistributionRow[]>(
    []
  );
  
  // Modal state for editing member
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState<string | null>(
    null
  );

  // Process data to create table structure
  const { rows, itemColumns } = useMemo(() => {
    if (!cateringData || cateringData.length === 0) {
      return { rows: [], itemColumns: [] };
    }

    // Get unique items and members
    const itemsMap = new Map<string, { id: string; name: string }>();
    const membersMap = new Map<string, string>(); // memberId -> memberName

    cateringData.forEach((item) => {
      if (!itemsMap.has(item.cateringItemId)) {
        itemsMap.set(item.cateringItemId, {
          id: item.cateringItemId,
          name: item.itemName,
        });
      }
      membersMap.set(item.memberId, item.memberName);
    });

    // Group data by member
    const memberDistributionMap = new Map<
      string,
      Map<string, { amount: number; remainingAmount: number }>
    >();

    cateringData.forEach((item) => {
      if (!memberDistributionMap.has(item.memberId)) {
        memberDistributionMap.set(item.memberId, new Map());
      }
      const memberItems = memberDistributionMap.get(item.memberId)!;
      memberItems.set(item.cateringItemId, {
        amount: item.amount,
        remainingAmount: item.remainingAmount,
      });
    });

    // Create rows
    const processedRows: CateringDistributionRow[] = Array.from(
      memberDistributionMap.entries()
    ).map(([memberId, items]) => {
      const row: CateringDistributionRow = {
        id: memberId,
        memberId,
        memberName: membersMap.get(memberId) || "Unknown",
      };

      itemsMap.forEach(({ id }) => {
        const itemData = items.get(id);
        if (itemData) {
          row[id] = `${itemData.amount} - ${itemData.remainingAmount}`;
        } else {
          row[id] = "N/A";
        }
      });

      return row;
    });

    return {
      rows: processedRows,
      itemColumns: Array.from(itemsMap.values()),
    };
  }, [cateringData]);

  // Handle search
  useEffect(() => {
    if (searchKey.trim() === "") {
      setDisplayedRows(rows);
    } else {
      const lowerSearchKey = searchKey.toLowerCase();
      const filtered = rows.filter((row) =>
        row.memberName.toLowerCase().includes(lowerSearchKey)
      );
      setDisplayedRows(filtered);
    }
  }, [searchKey, rows]);

  // Build dynamic columns
  const columns = useMemo(() => {
    return [
      {
        key: "memberName" as const,
        label: "Member Name",
        formatter: (value: string) => value || "N/A",
      },
      ...itemColumns.map((item) => ({
        key: item.id as keyof CateringDistributionRow,
        label: item.name,
        formatter: (value: string | number) => value || "-",
      })),
    ];
  }, [itemColumns]);

  const renderActionButton = (row: CateringDistributionRow) => (
    <Button
      buttonText="Edit"
      onClick={() => {
        setEditingMemberId(row.memberId);
        setEditingMemberName(row.memberName);
        setIsEditModalOpen(true);
      }}
      type="secondary"
      width="auto"
    />
  );

  return (
    <div className="bg-white dark:bg-surface-glass-bg rounded-b-lg shadow-sm border border-dashboard-card-border border-t-0 overflow-x-auto -mt-1">
      <div className="p-4 border-b border-dashboard-border flex md:flex-row flex-col gap-2 md:gap-4 items-center">
        <h3 className="text-lg font-bold text-text-muted-foreground">
          members {rows?.length ? `(${rows.length})` : ""}
        </h3>
        <SearchField
          placeholder="Search members..."
          value={searchKey}
          onChange={(value) => setSearchKey(value)}
        />
      </div>

      {displayedRows.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No members found with catering distribution.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <Table
            items={displayedRows}
            columns={columns}
            emptyMessage="No catering distribution found"
            renderActions={renderActionButton}
          />

          {/* Mobile Card View */}
          <CardView
            items={displayedRows}
            titleKey="memberName"
            renderedFields={itemColumns.map((item) => ({
              key: item.id,
              label: item.name,
              formatter: (value: string | number) => value || "-",
            }))}
            renderButtons={renderActionButton}
          />
        </>
      )}

      {/* Edit Member Catering Modal */}
      {editingMemberId && editingMemberName && (
        <EditMemberCateringModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          memberId={editingMemberId}
          memberName={editingMemberName}
          eventId={eventId}
          memberAllocations={cateringData.filter(
            (item) => item.memberId === editingMemberId
          )}
        />
      )}
    </div>
  );
};

export default CateringDistributionList;
