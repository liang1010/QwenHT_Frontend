export interface Incentive {
  id?: string;
  incentiveDate?: Date;
  staffId?: string;
  description?: string;
  remark?: string | null;
  amount?: number;
  status?: number;
  createdBy?: string | null;
  createdAt?: Date;
  lastUpdated?: Date;
  lastModifiedBy?: string | null;
}
