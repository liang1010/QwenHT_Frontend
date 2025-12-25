import { Component } from '@angular/core';
import { CommissionSettingService } from './commission-setting.service';

@Component({
  selector: 'app-commission-setting',
  templateUrl: './commission-setting.component.html',
  styleUrl: './commission-setting.component.scss'
})
export class CommissionSettingComponent {

  constructor(private commissionSettingService: CommissionSettingService) {

  }

  INCENTIVE_AMOUNT_MF: any
  INCENTIVE_AMOUNT_NMM: any
  INCENTIVE_HOURS_MF: any
  INCENTIVE_HOURS_NMF: any
  INCENTIVE_AMOUNT_NMF: any
  INCENTIVE_AMOUNT_MM: any
  INCENTIVE_HOURS_NMM: any
  INCENTIVE_HOURS_MM: any


  TREATMENT_PERCENT: any
  PRODUCT_PERCENT_TIER_1: any
  PRODUCT_PERCENT_TIER_2: any
  PRODUCT_TARGET: any
  ngOnInit(): void {
    this.commissionSettingService.getOptionValue().subscribe(x => {
      this.INCENTIVE_AMOUNT_MF = x.find(x => x.category == "INCENTIVE_AMOUNT_MF")?.value;
      this.INCENTIVE_AMOUNT_NMM = x.find(x => x.category == "INCENTIVE_AMOUNT_NMM")?.value;
      this.INCENTIVE_HOURS_MF = x.find(x => x.category == "INCENTIVE_HOURS_MF")?.value;
      this.INCENTIVE_HOURS_NMF = x.find(x => x.category == "INCENTIVE_HOURS_NMF")?.value;
      this.INCENTIVE_AMOUNT_NMF = x.find(x => x.category == "INCENTIVE_AMOUNT_NMF")?.value;
      this.INCENTIVE_AMOUNT_MM = x.find(x => x.category == "INCENTIVE_AMOUNT_MM")?.value;
      this.INCENTIVE_HOURS_NMM = x.find(x => x.category == "INCENTIVE_HOURS_NMM")?.value;
      this.INCENTIVE_HOURS_MM = x.find(x => x.category == "INCENTIVE_HOURS_MM")?.value;


      this.TREATMENT_PERCENT = x.find(x => x.category == "TREATMENT_PERCENT")?.value;
      this.PRODUCT_PERCENT_TIER_1 = x.find(x => x.category == "PRODUCT_PERCENT_TIER_1")?.value;
      this.PRODUCT_PERCENT_TIER_2 = x.find(x => x.category == "PRODUCT_PERCENT_TIER_2")?.value;
      this.PRODUCT_TARGET = x.find(x => x.category == "PRODUCT_TARGET")?.value;

    });
  }
}
