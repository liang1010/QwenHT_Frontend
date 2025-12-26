import { ConsultantPercentageBasedCommissionDto } from "../consultant-commission/consultant-commission.model";

export interface ConsultantPayoutReportDto {
  commissionPercentage: ConsultantPercentageBasedCommissionDto;
  totalPayout: number;
  nickName: string;
  fullName: string;
}
