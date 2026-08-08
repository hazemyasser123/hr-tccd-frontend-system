export interface CateringItem {
    id: string;
    name: string;
    description: string;
    quantity?: number;
}

export interface AllocatedCateringItem {
    memberId: string;
    eventId: string;
    cateringItemId: string;
    memberName: string;
    itemName: string;
    amount: number;
    remainingAmount: number;
    updatedAt: string;
}

export interface CateringAllocationRequest {
    memberId: string;
    eventId: string;
    cateringItemId: string;
    quantity: number;
}

export interface CompanyEntity {
    id: string;
    name: string;
    employeeCount: number;
    cateringItems: CateringItem[];
}