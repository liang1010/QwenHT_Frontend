export interface TherapistCommissionItem {
  id: string;
  salesDate: string; // ISO date string
  menuCode: string;
  footMins: number; // Total foot minutes for the day and menu code
  bodyMins: number; // Total body minutes for the day and menu code
  staffCommission: number; // Total staff commission for the day and menu code
  extraCommission: number; // Total extra commission for the day and menu code
}

export interface DailyTherapistCommissionSummaryDto {
  id: string;
  salesDate: string;
  menuCode: string;
  footMins: number;
  bodyMins: number;
  staffCommission: number;
  extraCommission: number;
  price: number;
}

export interface TherapistIncentiveDto {
  id: string;
  incentiveDate: string;
  description: string;
  remark: number;
  amount: number;
}

export interface TherapistCommissionReportDto {
  commissions: DailyTherapistCommissionSummaryDto[];
  incentives: TherapistIncentiveDto[];
  isRate: boolean;
  rateBase: TherapistRateBasedCommissionDto;
  isCommissionPercentage: boolean;
  commissionPercentage: TherapistPercentageBasedCommissionDto;
  isGuaranteeIncome: boolean;
  guaranteeIncome: TherapistGuaranteeIncomeCalculationDto;
  totalIncentive: number;
  totalPayout: number;
}

export interface TherapistGuaranteeIncomeCalculationDto {
  firstPeriodCommission: number;
  secondPeriodCommission: number;
  totalCommission: number;
  guaranteeIncomePaid: number;
}

export interface TherapistRateBasedCommissionDto {
  selectedPeriodHrs: number;
  allPeriodHrs: number;
  totalFootMins: number;
  totalFootCommission: number;
  totalBodyMins: number;
  totalBodyCommission: number;
  totalStaffCommission: number;
  totalExtraCommission: number;
  totalCommission: number;
}

export interface TherapistPercentageBasedCommissionDto {
  selectedPeriodHrs: number;
  allPeriodHrs: number;
  totalStaffCommission: number;
  totalExtraCommission: number;
  totalPrice: number;
  totalCommission: number;
  percentage:number;
}
