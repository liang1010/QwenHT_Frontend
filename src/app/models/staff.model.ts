export interface Staff {
  id?: string;
  nickName?: string;
  fullName?: string;
  phoneNo?: string;
  nationality?: string;
  hostelName?: string;
  hostelRoom?: string;
  reference?: string;
  status?: number; // 0 = Inactive, 1 = Active
  outlet?: string;
  type?: string;
  checkIn?: Date;
  checkOut?: Date;
  footRatePerHour?: number;
  bodyRatePerHour?: number;
  commissionBasePercentage?: number;
  guaranteeIncome?: number;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  createdBy?: string;
  createdAt?: Date;
  lastUpdated?: Date;
  lastModifiedBy?: string;
  // Related collections
  employments?: Employment[];
  compensations?: Compensation[];
  bankAccounts?: BankAccount[];
}

export interface Employment {
  id?: string;
  staffId?: string;
  outlet?: string;
  type?: string;
  checkIn?: Date;
  checkOut?: Date;
}

export interface Compensation {
  id?: string;
  staffId?: string;
  footRatePerHour?: number;
  bodyRatePerHour?: number;
  commissionBasePercentage?: number;
  guaranteeIncome?: number;
}

export interface BankAccount {
  id?: string;
  staffId?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
}