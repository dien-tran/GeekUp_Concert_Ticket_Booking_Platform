// ===== Voucher — matches backend VoucherResponse =====
export interface Voucher {
  id: string;
  code: string;
  concertId?: string;
  name?: string;
  description?: string;
  discountType?: string;      // "PERCENTAGE" | "FIXED_AMOUNT"
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit: number;         // total quantity
  usedCount: number;          // used quantity
  usageLimitPerUser?: number;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== Voucher Create/Update Request — matches VoucherRequest =====
export interface VoucherRequest {
  code: string;
  concertId?: string;
  name?: string;
  description?: string;
  discountType?: string;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usageLimitPerUser?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

// ===== Display Helpers =====
export const VOUCHER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  OUT_OF_STOCK: 'Out of Stock',
};

export const VOUCHER_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  INACTIVE: 'text-gray-600 bg-gray-50 border-gray-200',
  OUT_OF_STOCK: 'text-red-600 bg-red-50 border-red-200',
};
