export interface User {
  id: string;
  email: string;
  name: string;
  profileImageUrl: string;
  phoneNumber?: string;
  roles: string[];
  password?: string;
}