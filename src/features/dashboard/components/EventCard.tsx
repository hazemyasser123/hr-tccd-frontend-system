import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";
import type { Event } from "@/shared/types/event";
import QRScannerModal from "@/features/QRScan/scan_qr/QRScannerModal";
import format from "@/shared/utils/Formater";
import { IoIosPin } from "react-icons/io";
import { Button, ButtonTypes, ButtonWidths } from "tccd-ui";
import { IoTrashSharp } from "react-icons/io5";
import { TbListDetails } from "react-icons/tb";
import { FaEdit } from "react-icons/fa";
import { BsQrCode } from "react-icons/bs";

interface EventCardProps {
  event: Omit<Event, "attendees">;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const { id, title, startDate, endDate, location } = event;
  const navigate = useNavigate();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const now = new Date();
  const eventStart = new Date(startDate);
  const eventEnd = new Date(endDate);
  const isPastEvent = now >= eventEnd;
  const startMinus30 = new Date(eventStart.getTime() - 30 * 60 * 1000);
  const isUpcomingEvent = now < startMinus30;
  const [isPhoneScreen, setIsPhoneScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsPhoneScreen(window.innerWidth < 640);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-white dark:bg-surface-glass-bg rounded-xl shadow-md p-5 flex flex-col h-full relative justify-between gap-4">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-800 dark:text-text-title text-[20px] md:text-[22px] lg:text-[24px]">
            {title}
          </h3>
        </div>

        <div className="flex flex-col text-sm text-gray-500 dark:text-text-muted-foreground gap-1 text-[13px] md:text-[14px] lg:text-[15px]">
          <span className="flex gap-1 items-center">
            <FaCalendarAlt className="text-primary text-md mr-1" />
            <span className="font-semibold">Start Date:</span>{" "}
            {format(startDate, "full")}
          </span>
          <span className="flex gap-1 aitems-center">
            <FaCalendarAlt className="text-primary text-md mr-1" />
            <span className="font-semibold">End Date:</span>{" "}
            {format(endDate, "full")}
          </span>
          <span className="flex gap-1">
            <IoIosPin className="text-primary size-5 -ml-0.5" />
            <span className="font-semibold">Location:</span> {location}
          </span>
        </div>
      </div>

      <div className="flex justify-center md:justify-end items-center mt-1 gap-2">
        {/* Left side - Admin buttons */}
        {onEdit && (
          <Button
            buttonText={isPhoneScreen ? undefined : "Edit"}
            buttonIcon={isPhoneScreen ? <FaEdit size={16} /> : undefined}
            onClick={() => onEdit(id)}
            type={ButtonTypes.TERTIARY}
            width="fit"
          />
        )}
        {onDelete && (
          <Button
            buttonText={isPhoneScreen ? undefined : "Delete"}
            buttonIcon={isPhoneScreen ? <IoTrashSharp size={16} /> : undefined}
            onClick={() => onDelete(id)}
            type={ButtonTypes.DANGER}
            width={ButtonWidths.AUTO}
          />
        )}

        {/* Right side - Action buttons */}
        {!isUpcomingEvent && (
          <Button
            buttonText={isPhoneScreen ? undefined : "Details"}
            buttonIcon={isPhoneScreen ? <TbListDetails size={16} /> : undefined}
            onClick={() => navigate(`/events/${id}`)}
            type={ButtonTypes.SECONDARY}
            width={ButtonWidths.AUTO}
          />
        )}

        {!isUpcomingEvent && !isPastEvent && (
          <Button
            buttonText={isPhoneScreen ? undefined : "Scan QR"}
            buttonIcon={isPhoneScreen ? <BsQrCode size={16} /> : undefined}
            onClick={() => setIsQRModalOpen(true)}
            type={ButtonTypes.PRIMARY}
            width={ButtonWidths.AUTO}
          />
        )}
        {/* fallback */}
        {isUpcomingEvent && !isPastEvent && (
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 px-3 py-1 rounded-md text-xs">
            see you soon
          </span>
        )}
      </div>
      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        event={event}
      />
    </div>
  );
};

export default EventCard;
