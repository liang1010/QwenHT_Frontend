export interface Menu {
  id?: string;
  code?: string;
  description?: string;
  category?: string;
  footMins?: number;
  bodyMins?: number;
  staffCommission?: number;
  extraCommission?: number;
  price?: number;
  status?: number; // 0 = Inactive, 1 = Active
  createdBy?: string;
  createdAt?: Date;
  lastUpdated?: Date;
  lastModifiedBy?: string;
}
