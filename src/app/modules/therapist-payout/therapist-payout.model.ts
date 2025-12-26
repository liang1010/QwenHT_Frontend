import { TherapistPercentageBasedCommissionDto, TherapistRateBasedCommissionDto } from "../therapist-commission/therapist-commission.model";

export interface TherapistPayoutReportDto {

  totalStaffCommission: number;
  totalExtraCommission: number;
  totalBodyCommission: number;
  totalFootCommission: number;
  totalIncentive: number;
  totalPayout: number;
  nationality: string;
  outlet: string;
  nickName: string;
  fullName: string;
  bankName: string;
  bankAccNo: string;
  bankAccName: string;
  foot: number;
  body: number;
  staff: number;
  extra: number;
  incentive: number;
}
