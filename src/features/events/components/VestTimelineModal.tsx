import format from "@/shared/utils/Formater";
import { useVestTimeline } from "@/shared/queries/events";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ButtonTypes, ButtonWidths, Button, Modal } from "tccd-ui";

interface VestActivity {
    activityId: string;
    status: "NotReceived" | "Received" | "Returned";
    activityTime: string;
}

interface VestTimelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    attendeeName: string;
    memberId: string;
    eventId: string;
}

const VestTimelineModal = ({
    isOpen,
    onClose,
    attendeeName,
    memberId,
    eventId
}: VestTimelineModalProps) => {
    const { data, isLoading, error } = useVestTimeline(memberId, eventId);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    useEffect(() => {
        if (error && isOpen) {
            toast.error("Vest timeline data is not available");
        }
    }, [error, isOpen]);

    useEffect(() => {
        setCurrentPage(1);
    }, [isOpen, data]);

    const activities: VestActivity[] = data?.data || [];

    const records: Array<{
        id: string;
        receivedTime?: Date;
        returnedTime?: Date;
    }> = [];

    for (let i = 0; i < activities.length; i += 2) {
        const received = activities[i];
        const returned = activities[i + 1];

        records.push({
            id: received.activityId,
            receivedTime: new Date(received.activityTime),
            returnedTime: returned ? new Date(returned.activityTime) : undefined
        });
    }


    return (
        <Modal title={`${attendeeName}'s vest timeline`} isOpen={isOpen} onClose={onClose}>
            {isLoading && (
                <div className="text-dashboard-card-text flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3">Loading timeline...</span>
                </div>
            )}

            {!isLoading && error && (
                <div className="text-inactive-tab-text">
                    Timeline for this member is not available
                </div>
            )}

            {!isLoading && !error && records.length === 0 && (
                <div className="text-inactive-tab-text">
                    Timeline for this member is empty, they haven't received any vests yet
                </div>
            )}

            {!isLoading && !error && records.length > 0 && (
                <>
                    <div className="space-y-4">
                        {records
                            .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                            .map((record, index) => (
                                <div key={record.id} className="border border-dashboard-border rounded-md p-4 shadow-lg">
                                    <h4 className="font-medium text-dashboard-card-text mb-2 md:mb-5 lg:text-[20px] md:text-[18px] text-[16px]">
                                        Record {(currentPage - 1) * recordsPerPage + index + 1}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="font-medium text-dashboard-heading lg:text-[16px] md:text-[15px] text-[14px]">
                                                Received:
                                            </span>
                                            <p className="text-dashboard-card-text lg:text-[16px] md:text-[14px] text-[12px]">
                                                {record.receivedTime
                                                    ? format(record.receivedTime, "full")
                                                    : <span className="text-inactive-tab-text">N/A</span>
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-dashboard-heading lg:text-[16px] md:text-[15px] text-[14px]">
                                                Returned:
                                            </span>
                                            <p className="text-dashboard-card-text lg:text-[16px] md:text-[14px] text-[12px]">
                                                {record.returnedTime
                                                    ? format(record.returnedTime, "full")
                                                    : <span className="text-inactive-tab-text">Still assigned</span>
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Pagination Controls */}
                    {records.length > recordsPerPage && (
                        <div className="mt-6 flex items-center justify-between border-t border-dashboard-border pt-4">
                            <Button
                                buttonText="Previous"
                                type={ButtonTypes.SECONDARY}
                                width={ButtonWidths.AUTO}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            />

                            <span className="text-dashboard-card-text lg:text-[16px] md:text-[14px] text-[12px]">
                                Page {currentPage} of {Math.ceil(records.length / recordsPerPage)}
                            </span>

                            <Button
                                buttonText="Next"
                                type={ButtonTypes.SECONDARY}
                                width={ButtonWidths.AUTO}
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(records.length / recordsPerPage), prev + 1))}
                                disabled={currentPage === Math.ceil(records.length / recordsPerPage)}
                            />
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
};

export default VestTimelineModal;