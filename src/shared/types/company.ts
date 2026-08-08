export interface Company {
  id: string;
  name: string;
  email: string;
  logo: string;
}

export interface CompanyQRScanResponse {
  companyId: string;
  companyName: string;
}

export interface CompanyCateringAllocation {
  companyId: string;
  eventId: string;
  cateringItemId: string;
  companyName: string;
  itemName: string;
  amount: number;
  remainingAmount: number;
  updatedAt: string;
}

export interface CompanyPayload {
  name: string;
  email: string;
  logo: string;
}

export interface CompanyAllocationItemInput {
  cateringItemId: string;
  amount: number;
}

//This shouldn't even exist, but the backend works in mysterious ways
export interface CompanyAllocationItemConsume{
  cateringItemId: string;
  quantity: number
}