export interface TherapistCommissionItem {
  id: string;
  salesDate: string; // ISO date string
  menuCode: string;
  footMins: number; // Total foot minutes for the day and menu code
  bodyMins: number; // Total body minutes for the day and menu code
  staffCommission: number; // Total staff commission for the day and menu code
  extraCommission: number; // Total extra commission for the day and menu code
}