export interface ConsultantCommissionItem {
  id: string;
  salesDate: string; // ISO date string
  menuCode: string;
  footMins: number; // Total foot minutes for the day and menu code
  bodyMins: number; // Total body minutes for the day and menu code
  staffCommission: number; // Total staff commission for the day and menu code
  extraCommission: number; // Total extra commission for the day and menu code
}

export interface DailyConsultantCommissionSummaryDto {
  id: string;
  salesDate: string;
  menuCode: string;
  extraCommission: number;
  price: number;
}

export interface ConsultantCommissionReportDto {
  productCommissions: DailyConsultantCommissionSummaryDto[];
  treatmentCommissions: DailyConsultantCommissionSummaryDto[];
  commissionPercentage: ConsultantPercentageBasedCommissionDto;
  totalPayout: number;
}


export interface ConsultantPercentageBasedCommissionDto {
  totalProductExtraCommission: number;
  totalProductPrice: number;
  totalProductCommission: number;
  productPercentage: number;
  totalTreatmentExtraCommission: number;
  totalTreatmentPrice: number;
  totalTreatmentCommission: number;
  treatmentPercentage: number;
}
