import type { Event, Attendee, VestAttendee } from "@/shared/types/event";
import { format } from "@/shared/utils";
import { Button } from "tccd-ui";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store/store";
import type { AllocatedCateringItem, CateringItem } from "@/shared/types/catering";
import type {
  Company,
  CompanyCateringAllocation,
} from "@/shared/types/company";
import { useMemo, useState } from "react";
import ManageCateringModal from "./ManageCateringModal";
import AddCompanyModal from "./AddCompanyModal";
import ManageCompanyCateringModal from "./ManageCompanyCateringModal";

interface EventInformationProps {
  event: Event;
  attendees?: Attendee[];
  vestAttendees?: VestAttendee[];
  cateringData?: AllocatedCateringItem[];
  companiesData?: Company[];
  companyCateringData?: CompanyCateringAllocation[];
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  activeTab?: "attendance" | "vest" | "catering" | "companies";
}

const EventInformation = ({
  event,
  attendees,
  vestAttendees,
  cateringData,
  companiesData,
  companyCateringData,
  onEdit,
  onDelete,
  activeTab = "attendance",
}: EventInformationProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.roles || [];
  const isAdmin = userRole.includes("Admin");

  const [isCateringModalOpen, setIsCateringModalOpen] = useState(false);
  const [isCompanyCateringModalOpen, setIsCompanyCateringModalOpen] =
    useState(false);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);

  const membersData = useMemo(() => {
    return attendees?.map(att => ({ id: att.id, name: att.name })) || [];
  }, [attendees]);

  const companiesSelectionData = useMemo(
    () => companiesData?.map((company) => ({ id: company.id, name: company.name })) || [],
    [companiesData]
  );

  const formattedCateringItems = useMemo(() => {
    return Object.values(
      cateringData?.reduce((acc: Record<string, CateringItem>, item) => {
        if (!acc[item.cateringItemId]) {
          acc[item.cateringItemId] = { name: item.itemName, quantity: item.amount, description: "", id: item.cateringItemId };
        }
        return acc;
      }, {} as Record<string, CateringItem>) || {}
    );
  }, [cateringData]);

  const formattedCompanyCateringItems = useMemo(() => {
    return Object.values(
      companyCateringData?.reduce((acc: Record<string, CateringItem>, item) => {
        if (!acc[item.cateringItemId]) {
          acc[item.cateringItemId] = {
            name: item.itemName,
            quantity: item.amount,
            description: "",
            id: item.cateringItemId,
          };
        }
        return acc;
      }, {} as Record<string, CateringItem>) || {}
    );
  }, [companyCateringData]);

  return (
    <div className="bg-white dark:bg-surface-glass-bg rounded-b-lg shadow-sm border border-dashboard-card-border border-t-0 p-4 sm:p-6 mb-4 sm:mb-6 -mt-1">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dashboard-heading">
          {event.title || "Untitled Event"}
        </h2>
        <div className="flex gap-2">
          {onEdit && isAdmin && (
            <Button
              buttonText="Edit"
              onClick={() => onEdit(event.id)}
              type="tertiary"
              width="auto"
            />
          )}
          {onDelete && isAdmin && (
            <Button
              buttonText="Delete"
              onClick={() => onDelete(event.id)}
              type="danger"
              width="auto"
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 text-dashboard-description">
        <div className="flex flex-col space-y-1 sm:space-y-2">
          <span className="font-semibold text-dashboard-heading text-xs sm:text-sm lg:text-base">
            Start Date & Time
          </span>
          <div className="text-dashboard-card-text text-sm sm:text-base lg:text-lg">
            {event.startDate ? format(event.startDate, "full") : "N/A"}
          </div>
        </div>
        <div className="flex flex-col space-y-1 sm:space-y-2">
          <span className="font-semibold text-dashboard-heading text-xs sm:text-sm lg:text-base">
            End Date & Time
          </span>
          <div className="text-dashboard-card-text text-sm sm:text-base lg:text-lg">
            {event.endDate ? format(event.endDate, "full") : "N/A"}
          </div>
        </div>
      </div>

      {/* Event Summary - Attendance Tab */}
      {activeTab === "attendance" && attendees && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-dashboard-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 text-center">
            <div className="bg-slate-100 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-gray-100">
                {attendees.length}
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-gray-300">
                Total
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-800/40 rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-emerald-600 dark:text-emerald-300">
                {
                  attendees.filter((a) => a.status.toLowerCase() === "attended")
                    .length
                }
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-emerald-500 dark:text-emerald-200">
                Attended
              </div>
            </div>
            <div className="bg-rose-50 dark:bg-rose-800/40 rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-rose-600 dark:text-rose-300">
                {
                  attendees.filter((a) => a.status.toLowerCase() === "absent")
                    .length
                }
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-rose-500 dark:text-rose-200">
                Absent
              </div>
            </div>
            <div className="bg-sky-50 dark:bg-sky-800/40 rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-300">
                {
                  attendees.filter((a) => a.status.toLowerCase() === "left")
                    .length
                }
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-sky-500 dark:text-sky-200">
                Left
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Summary - Vest Tab */}
      {activeTab === "vest" && vestAttendees && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-dashboard-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 text-center">
            <div className="bg-slate-100 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-gray-100">
                {vestAttendees.length}
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-gray-300">
                Total
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-800/40 rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-300">
                {
                  vestAttendees.filter((a) => a.status === "Received")
                    .length
                }
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-green-500 dark:text-green-200">
                Received
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-800/40 rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-300">
                {
                  vestAttendees.filter((a) => a.status === "Returned")
                    .length
                }
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-blue-500 dark:text-blue-200">
                Returned
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-800/40 rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-300">
                {
                  vestAttendees.filter((a) => a.status === "NotReceived")
                    .length
                }
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-amber-500 dark:text-amber-200">
                Not Received
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Summary - Catering Tab */}
      {activeTab === "catering" && (
        <>
        {cateringData && cateringData.length > 0 ? (
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-dashboard-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Catering Items</h3>
              <Button
                buttonText="Manage Items"
                onClick={() => setIsCateringModalOpen(true)}
                type="primary"
                width="auto"
              />
            </div>
            <div className="space-y-3">
              {Object.entries(
                cateringData.reduce((acc: Record<string, { itemName: string; total: number; remaining: number }>, item) => {
                  if (!acc[item.cateringItemId]) {
                    acc[item.cateringItemId] = {
                      itemName: item.itemName,
                      total: 0,
                      remaining: 0,
                    };
                  }
                  acc[item.cateringItemId].total += item.amount;
                  acc[item.cateringItemId].remaining += item.remainingAmount;
                  return acc;
                }, {})
              ).map(([itemId, itemData]) => {
                const used = itemData.total - itemData.remaining;
                return (
                  <div key={itemId} className="rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">{itemData.itemName}</h4>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-blue-50 dark:bg-blue-800/40 rounded p-2">
                            <div className="font-bold text-blue-600 dark:text-blue-300">{itemData.total}</div>
                            <div className="text-xs text-blue-500 dark:text-blue-200">Total</div>
                          </div>
                          <div className="bg-red-50 dark:bg-red-800/40 rounded p-2">
                            <div className="font-bold text-red-600 dark:text-red-300">{used}</div>
                            <div className="text-xs text-red-500 dark:text-red-200">Used</div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-800/40 rounded p-2">
                            <div className="font-bold text-green-600 dark:text-green-300">{itemData.remaining}</div>
                            <div className="text-xs text-green-500 dark:text-green-200">Remaining</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-dashboard-border flex flex-col items-center text-dashboard-description">
            No catering items allocated for this event.
            <Button
              buttonText="Allocate Catering"
              onClick={() => setIsCateringModalOpen(true)}
              type="primary"
              width="auto"
              className="mt-3"
            />
          </div>
        )}
        </>
      )}

      {activeTab === "companies" && (
        <>
          {companyCateringData && companyCateringData.length > 0 ? (
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-dashboard-border">
              <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Company Catering Items
                </h3>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Button
                      buttonText="Add Company"
                      onClick={() => setIsAddCompanyModalOpen(true)}
                      type="secondary"
                      width="auto"
                    />
                    <Button
                      buttonText="Manage Items"
                      onClick={() => setIsCompanyCateringModalOpen(true)}
                      type="primary"
                      width="auto"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {Object.entries(
                  companyCateringData.reduce(
                    (
                      acc: Record<
                        string,
                        { itemName: string; total: number; remaining: number }
                      >,
                      item
                    ) => {
                      if (!acc[item.cateringItemId]) {
                        acc[item.cateringItemId] = {
                          itemName: item.itemName,
                          total: 0,
                          remaining: 0,
                        };
                      }

                      acc[item.cateringItemId].total += item.amount;
                      acc[item.cateringItemId].remaining += item.remainingAmount;
                      return acc;
                    },
                    {}
                  )
                ).map(([itemId, itemData]) => {
                  const used = itemData.total - itemData.remaining;

                  return (
                    <div
                      key={itemId}
                      className="rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                            {itemData.itemName}
                          </h4>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="bg-blue-50 dark:bg-blue-800/40 rounded p-2">
                              <div className="font-bold text-blue-600 dark:text-blue-300">
                                {itemData.total}
                              </div>
                              <div className="text-xs text-blue-500 dark:text-blue-200">
                                Total
                              </div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-800/40 rounded p-2">
                              <div className="font-bold text-red-600 dark:text-red-300">
                                {used}
                              </div>
                              <div className="text-xs text-red-500 dark:text-red-200">
                                Used
                              </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-800/40 rounded p-2">
                              <div className="font-bold text-green-600 dark:text-green-300">
                                {itemData.remaining}
                              </div>
                              <div className="text-xs text-green-500 dark:text-green-200">
                                Remaining
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-dashboard-border flex flex-col items-center text-dashboard-description">
              No company catering items allocated for this event.
              {isAdmin && (
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    buttonText="Add Company"
                    onClick={() => setIsAddCompanyModalOpen(true)}
                    type="secondary"
                    width="auto"
                  />
                  <Button
                    buttonText="Manage Items"
                    onClick={() => setIsCompanyCateringModalOpen(true)}
                    type="primary"
                    width="auto"
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ManageCateringModal
        isOpen={isCateringModalOpen}
        onClose={() => setIsCateringModalOpen(false)}
        eventId={event.id}
        cateringData={formattedCateringItems}
        membersData={membersData}
      />

      <ManageCompanyCateringModal
        isOpen={isCompanyCateringModalOpen}
        onClose={() => setIsCompanyCateringModalOpen(false)}
        eventId={event.id}
        cateringData={formattedCompanyCateringItems}
        companiesData={companiesSelectionData}
      />

      <AddCompanyModal
        isOpen={isAddCompanyModalOpen}
        onClose={() => setIsAddCompanyModalOpen(false)}
        eventId={event.id}
      />
    </div>
  );
};

export default EventInformation;
