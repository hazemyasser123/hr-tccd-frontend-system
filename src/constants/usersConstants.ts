export const USERS_SORTING_OPTIONS = [
  { label: "Name (A-Z)", value: "az" },
  { label: "Name (Z-A)", value: "za" },
  { label: "Committee (A-Z)", value: "caz" },
  { label: "Committee (Z-A)", value: "cza" },
];

export const TEAM_COMMITTEES = [
  { label: "All Committees", value: "All" },
  { label: "HR", value: "HumanResources" },
  { label: "IT", value: "IT" },
  { label: "Graphic Design", value: "GraphicDesign" },
  { label: "External Relations", value: "ExternalRelations" },
  { label: "Content Creation", value: "ContentCreation" },
  { label: "Marketing", value: "Marketing" },
  { label: "Video Editing", value: "VideoEditing" },
  { label: "High Board", value: "HighBoard" },
  { label: "Outsource", value: "Outsource" },
];

export const COMMITTEES_OPTIONS = TEAM_COMMITTEES.filter(
  (c) => c.value !== "All",
);

export const EDUCATION_SYSTEMS = [
  { label: "Mainstream", value: "Mainstream" },
  { label: "Credit Hours", value: "Credit" },
];

export const POSITIONS = [
  { label: "Member", value: "Member" },
  { label: "Head", value: "Head" },
  { label: "Director", value: "Director" },
  { label: "President", value: "President" },
  { label: "Vice President", value: "VicePresident" },
];
