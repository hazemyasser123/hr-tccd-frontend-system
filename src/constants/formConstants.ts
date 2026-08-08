import type { DateQuestion, MCQQuestion, EssayQuestion, NumberQuestion, UploadQuestion } from "@/shared/types/question";

const SUBMISSION_CATCHER = {
    title: "Finished",
    description: "You may now click submit to finish up your form submission.",
    questions: [],
}

const QUESTION_TYPES = ["Essay", "MCQ", "Date", "Number", "Upload"] as const;

type AllowedFields = {
  Essay: (keyof EssayQuestion)[];
  MCQ: (keyof MCQQuestion)[];
  Number: (keyof NumberQuestion)[];
  Date: (keyof DateQuestion)[];
  Upload: (keyof UploadQuestion)[];
};


const ALLOWED_FIELDS: AllowedFields = {
    Essay: ["questionText", "questionType", "maxLength", "isMandatory", "isTextArea", "questionNumber", "description"],
    MCQ: ["questionText", "questionType", "choices", "isMandatory", "isMultiSelect", "questionNumber", "description"],
    Date: ["questionText", "questionType", "minDate", "maxDate", "isMandatory", "questionNumber", "description"],
    Number: ["questionText", "questionType", "isInteger", "isMandatory", "questionNumber", "description"],
    Upload: ["questionText", "questionType", "isMandatory", "maxFileSizeMB", "allowedFileTypes", "questionNumber", "description"],
}

const FORM_SORTING_OPTIONS = [
  { label: "Newest First", value: "CreatedAtDesc" },
  { label: "Oldest First", value: "CreatedAtAsc" },
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
];

const FORM_TYPES = [
  { label: "All Forms", value: "All" },
  { label: "Database Update", value: "DatabaseUpdate" },
  { label: "Research Day", value: "ResearchDay" },
  { label: "Recruitment", value: "Recruitment" },
  { label: "Job Fair", value: "JobFair" },
  { label: "Workshop", value: "Workshop" },
  { label: "Session", value: "Session" },
  { label: "Site Visit", value: "FieldVisit"},
  { label: "Meeting Availability", value: "MeetingAvailability" },
  { label: "Feedback Collection", value: "FeedbackCollection" },
  { label: "Testing", value: "Testing" },
  { label: "Career Opportunities", value: "CareerOpportunities" },
  { label: "Templates", value: "Templates" },
  { label: "Others", value: "Others" },
];

export { SUBMISSION_CATCHER, QUESTION_TYPES, ALLOWED_FIELDS, FORM_SORTING_OPTIONS, FORM_TYPES };
export type { AllowedFields };