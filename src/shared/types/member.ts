export interface member {
  id: string;
  name: string;
  role?: string;
  committee: string;
  email: string;
  phoneNumber: string;
  position?: string;
  nationalId: string;
  engineeringMajor: string;
  educationSystem: string;
  gradYear: number;
  hasAccount?: boolean;
  accountPassword?: string;
}
