import type { Attendee } from "@/shared/types/event";
import format from "@/shared/utils/Formater";
import { Modal } from "tccd-ui";

export default function AttendeeTimelineModal ({Attendee, onCLose} : {Attendee: Attendee, onCLose: () => void}) {
    return (
        <Modal title={`${Attendee.name}'s timeline`} isOpen={true} onClose={() => onCLose()}>
            {Attendee.attendanceRecords.length === 0 && (
                <div className="text-inactive-tab-text">
                    Timeline for this member is empty, they haven't attended yet
                </div>
            )}
            {Attendee.attendanceRecords.length > 0 && (
                <div className="space-y-4">
                    {Attendee.attendanceRecords.map((record, index) => (
                        <div key={index} className="border border-dashboard-border rounded-md p-4 shadow-lg">
                            <h4 className="font-medium text-dashboard-card-text mb-2 md:mb-5 lg:text-[20px] md:text-[18px] text-[16px]">Record {index + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="font-medium text-dashboard-heading lg:text-[16px] md:text-[15px] text-[14px]">Arrival:</span>
                                    <p className="text-dashboard-card-text lg:text-[16px] md:text-[14px] text-[12px]">
                                        {format(new Date(record.checkInTime), "full")}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-dashboard-heading lg:text-[16px] md:text-[15px] text-[14px]">Leaving:</span>
                                    <p className="text-dashboard-card-text lg:text-[16px] md:text-[14px] text-[12px]">
                                        {record.checkOutTime
                                            ? format(new Date(record.checkOutTime), "full")
                                            : <span className="text-inactive-tab-text">N/A</span>
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    )
}