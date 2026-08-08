import { useState, useEffect } from "react";
import EVENT_TYPES from "@/constants/eventTypes";
import type { Event } from "@/shared/types/event";
import {
  useAddEvent,
  useUpdateEvent,
} from "@/shared/queries/events/eventQueries";
import {
  Button,
  Modal,
  InputField,
  TextAreaField,
  DatePicker,
  DropdownMenu,
  ButtonTypes,
  ButtonWidths,
  Timepicker,
} from "tccd-ui";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null; // null for create, Event for edit
  mode: "create" | "edit";
}

interface EventFormData {
  title: string;
  description: string;
  location: string;
  eventType: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

const EventModal = ({ isOpen, onClose, event, mode }: EventModalProps) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    location: "",
    eventType: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  const addEventMutation = useAddEvent();
  const updateEventMutation = useUpdateEvent();

  const isLoading = addEventMutation.isPending || updateEventMutation.isPending;

  // Function to format datetime string for date and time inputs
  const formatDateTimeForInput = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      const dateStr =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0");
      const timeStr =
        String(date.getHours()).padStart(2, "0") +
        ":" +
        String(date.getMinutes()).padStart(2, "0");
      return { date: dateStr, time: timeStr };
    } catch (error) {
      console.error("Error formatting date:", error);
      return { date: "", time: "" };
    }
  };

  // Initialize form data when modal opens or event changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && event) {
        const eventTypeValue =
          EVENT_TYPES.find((type) => type.value === event.eventType)?.value ||
          "";

        const startDateTime = formatDateTimeForInput(event.startDate);
        const endDateTime = formatDateTimeForInput(event.endDate);

        setFormData({
          title: event.title || "",
          description: event.description || "",
          location: event.location || "",
          eventType: eventTypeValue,
          startDate: startDateTime.date,
          startTime: startDateTime.time,
          endDate: endDateTime.date,
          endTime: endDateTime.time,
        });
      } else {
        setFormData({
          title: "",
          description: "",
          location: "",
          eventType: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, event]);

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.eventType) {
      newErrors.eventType = "Event type is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    // Check if end date/time is after start date/time
    if (
      formData.startDate &&
      formData.startTime &&
      formData.endDate &&
      formData.endTime
    ) {
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`,
      );
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        newErrors.endDate =
          "End date and time must be after start date and time";
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to convert local date/time to UTC
  const convertToUTC = (date: string, time: string): string => {
    const localDateTime = new Date(`${date}T${time}`);
    return localDateTime.toISOString();
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const eventData: Omit<Event, "id"> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      eventType: formData.eventType,
      startDate: convertToUTC(formData.startDate, formData.startTime),
      endDate: convertToUTC(formData.endDate, formData.endTime),
    };

    try {
      if (mode === "create") {
        await addEventMutation.mutateAsync(eventData);
      } else if (mode === "edit" && event) {
        await updateEventMutation.mutateAsync({
          eventId: event.id,
          eventData: eventData,
        });
      }
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      title={mode === "create" ? "Create New Event" : "Edit Event"}
      isOpen={isOpen}
      onClose={handleClose}
    >
      {/* Form */}
      <div id="event-form" className="flex flex-col gap-4 p-1">
        {/* Title */}
        <InputField
          label="Event Title"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          error={errors.title}
          placeholder="Enter event title"
        />

        {/* Description */}
        <TextAreaField
          label="Description"
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          error={errors.description}
          placeholder="Enter event description"
        />

        {/* Location */}
        <InputField
          label="Location"
          id="location"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          error={errors.location}
          placeholder="Enter event location"
        />

        {/* Event Type */}
        <DropdownMenu
          label="Event Type"
          id="eventType"
          value={formData.eventType}
          onChange={(value) => handleInputChange("eventType", value)}
          options={EVENT_TYPES}
          error={errors.eventType}
          disabled={isLoading}
          placeholder="Select event type"
        />

        {/* Start Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <DatePicker
              label="Start Date"
              id="startDate"
              value={formData.startDate}
              onChange={(value) => handleInputChange("startDate", value)}
              error={errors.startDate}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col w-full">
            <Timepicker
              label="Start Time"
              id="startTime"
              value={formData.startTime}
              onChange={(value) => handleInputChange("startTime", value)}
              error={errors.startTime}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* End Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <DatePicker
              label="End Date"
              id="endDate"
              value={formData.endDate}
              onChange={(value) => handleInputChange("endDate", value)}
              error={errors.endDate}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col w-full">
            <Timepicker
              label="End Time"
              id="endTime"
              value={formData.endTime}
              onChange={(value) => handleInputChange("endTime", value)}
              error={errors.endTime}
              disabled={isLoading}
            />
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            buttonText="Cancel"
            type={ButtonTypes.SECONDARY}
            width={ButtonWidths.FULL}
            onClick={handleClose}
            disabled={isLoading}
          />
          <Button
            buttonText={mode === "create" ? "Create Event" : "Save Changes"}
            type={ButtonTypes.PRIMARY}
            width={ButtonWidths.FULL}
            disabled={isLoading}
            loading={isLoading}
            onClick={() => handleSubmit()}
          />
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;
