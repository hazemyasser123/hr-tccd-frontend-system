export interface FilterSearchParams {
  nameKey: string;
  setNameKey: (nameKey: string) => void;
  codeKey: string;
  setCodeKey: (codeKey: string) => void;
  departmentKey: string;
  setDepartmentKey: (departmentKey: string) => void;
  courseKey: string;
  setCourseKey: (courseKey: string) => void;
  statusKey?: string;
  setStatusKey?: (statusKey: string) => void;
}
