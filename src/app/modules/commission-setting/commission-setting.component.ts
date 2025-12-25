import { Component } from '@angular/core';
import { CommissionSettingService } from './commission-setting.service';
import { OptionValue } from '../../models/option-value.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-commission-setting',
  templateUrl: './commission-setting.component.html',
  styleUrl: './commission-setting.component.scss'
})
export class CommissionSettingComponent {
  INCENTIVE_AMOUNT_MF: any;
  INCENTIVE_AMOUNT_NMM: any;
  INCENTIVE_HOURS_MF: any;
  INCENTIVE_HOURS_NMF: any;
  INCENTIVE_AMOUNT_NMF: any;
  INCENTIVE_AMOUNT_MM: any;
  INCENTIVE_HOURS_NMM: any;
  INCENTIVE_HOURS_MM: any;
  TREATMENT_PERCENT: any;
  PRODUCT_PERCENT_TIER_1: any;
  PRODUCT_PERCENT_TIER_2: any;
  PRODUCT_TARGET: any;

  // Track original values for edit functionality
  originalValues: any = {};
  isEditing: boolean = false;

  constructor(
    private commissionSettingService: CommissionSettingService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCommissionSettings();
  }

  loadCommissionSettings(): void {
    this.commissionSettingService.getOptionValue().subscribe({
      next: (x) => {
        this.INCENTIVE_AMOUNT_MF = x.find(item => item.category == "INCENTIVE_AMOUNT_MF")?.value;
        this.INCENTIVE_AMOUNT_NMM = x.find(item => item.category == "INCENTIVE_AMOUNT_NMM")?.value;
        this.INCENTIVE_HOURS_MF = x.find(item => item.category == "INCENTIVE_HOURS_MF")?.value;
        this.INCENTIVE_HOURS_NMF = x.find(item => item.category == "INCENTIVE_HOURS_NMF")?.value;
        this.INCENTIVE_AMOUNT_NMF = x.find(item => item.category == "INCENTIVE_AMOUNT_NMF")?.value;
        this.INCENTIVE_AMOUNT_MM = x.find(item => item.category == "INCENTIVE_AMOUNT_MM")?.value;
        this.INCENTIVE_HOURS_NMM = x.find(item => item.category == "INCENTIVE_HOURS_NMM")?.value;
        this.INCENTIVE_HOURS_MM = x.find(item => item.category == "INCENTIVE_HOURS_MM")?.value;

        this.TREATMENT_PERCENT = x.find(item => item.category == "TREATMENT_PERCENT")?.value;
        this.PRODUCT_PERCENT_TIER_1 = x.find(item => item.category == "PRODUCT_PERCENT_TIER_1")?.value;
        this.PRODUCT_PERCENT_TIER_2 = x.find(item => item.category == "PRODUCT_PERCENT_TIER_2")?.value;
        this.PRODUCT_TARGET = x.find(item => item.category == "PRODUCT_TARGET")?.value;

        // Store original values for potential revert
        this.storeOriginalValues();
      },
      error: (error) => {
        console.error('Error loading commission settings:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load commission settings' });
      }
    });
  }

  storeOriginalValues(): void {
    this.originalValues = {
      INCENTIVE_AMOUNT_MF: this.INCENTIVE_AMOUNT_MF,
      INCENTIVE_AMOUNT_NMM: this.INCENTIVE_AMOUNT_NMM,
      INCENTIVE_HOURS_MF: this.INCENTIVE_HOURS_MF,
      INCENTIVE_HOURS_NMF: this.INCENTIVE_HOURS_NMF,
      INCENTIVE_AMOUNT_NMF: this.INCENTIVE_AMOUNT_NMF,
      INCENTIVE_AMOUNT_MM: this.INCENTIVE_AMOUNT_MM,
      INCENTIVE_HOURS_NMM: this.INCENTIVE_HOURS_NMM,
      INCENTIVE_HOURS_MM: this.INCENTIVE_HOURS_MM,
      TREATMENT_PERCENT: this.TREATMENT_PERCENT,
      PRODUCT_PERCENT_TIER_1: this.PRODUCT_PERCENT_TIER_1,
      PRODUCT_PERCENT_TIER_2: this.PRODUCT_PERCENT_TIER_2,
      PRODUCT_TARGET: this.PRODUCT_TARGET
    };
  }

  startEditing(): void {
    this.isEditing = true;
    this.storeOriginalValues();
  }

  cancelEditing(): void {
    this.isEditing = false;
    // Revert to original values
    this.INCENTIVE_AMOUNT_MF = this.originalValues.INCENTIVE_AMOUNT_MF;
    this.INCENTIVE_AMOUNT_NMM = this.originalValues.INCENTIVE_AMOUNT_NMM;
    this.INCENTIVE_HOURS_MF = this.originalValues.INCENTIVE_HOURS_MF;
    this.INCENTIVE_HOURS_NMF = this.originalValues.INCENTIVE_HOURS_NMF;
    this.INCENTIVE_AMOUNT_NMF = this.originalValues.INCENTIVE_AMOUNT_NMF;
    this.INCENTIVE_AMOUNT_MM = this.originalValues.INCENTIVE_AMOUNT_MM;
    this.INCENTIVE_HOURS_NMM = this.originalValues.INCENTIVE_HOURS_NMM;
    this.INCENTIVE_HOURS_MM = this.originalValues.INCENTIVE_HOURS_MM;
    this.TREATMENT_PERCENT = this.originalValues.TREATMENT_PERCENT;
    this.PRODUCT_PERCENT_TIER_1 = this.originalValues.PRODUCT_PERCENT_TIER_1;
    this.PRODUCT_PERCENT_TIER_2 = this.originalValues.PRODUCT_PERCENT_TIER_2;
    this.PRODUCT_TARGET = this.originalValues.PRODUCT_TARGET;
  }

  saveChanges(): void {
    // Create a mapping of current values to compare with original values
    const currentValues = {
      INCENTIVE_AMOUNT_MF: this.INCENTIVE_AMOUNT_MF,
      INCENTIVE_AMOUNT_NMM: this.INCENTIVE_AMOUNT_NMM,
      INCENTIVE_HOURS_MF: this.INCENTIVE_HOURS_MF,
      INCENTIVE_HOURS_NMF: this.INCENTIVE_HOURS_NMF,
      INCENTIVE_AMOUNT_NMF: this.INCENTIVE_AMOUNT_NMF,
      INCENTIVE_AMOUNT_MM: this.INCENTIVE_AMOUNT_MM,
      INCENTIVE_HOURS_NMM: this.INCENTIVE_HOURS_NMM,
      INCENTIVE_HOURS_MM: this.INCENTIVE_HOURS_MM,
      TREATMENT_PERCENT: this.TREATMENT_PERCENT,
      PRODUCT_PERCENT_TIER_1: this.PRODUCT_PERCENT_TIER_1,
      PRODUCT_PERCENT_TIER_2: this.PRODUCT_PERCENT_TIER_2,
      PRODUCT_TARGET: this.PRODUCT_TARGET
    };

    // Compare current values with original values and only include modified ones
    const modifiedValues: OptionValue[] = [];

    // Type the keys properly to avoid TypeScript error
    const keys = Object.keys(currentValues) as (keyof typeof currentValues)[];

    keys.forEach(key => {
      // Compare the current value with the original value
      if (currentValues[key] !== this.originalValues[key]) {
        // Map the key to the corresponding category
        const categoryMap: { [K in keyof typeof currentValues]: string } = {
          'INCENTIVE_AMOUNT_MF': 'INCENTIVE_AMOUNT_MF',
          'INCENTIVE_AMOUNT_NMM': 'INCENTIVE_AMOUNT_NMM',
          'INCENTIVE_HOURS_MF': 'INCENTIVE_HOURS_MF',
          'INCENTIVE_HOURS_NMF': 'INCENTIVE_HOURS_NMF',
          'INCENTIVE_AMOUNT_NMF': 'INCENTIVE_AMOUNT_NMF',
          'INCENTIVE_AMOUNT_MM': 'INCENTIVE_AMOUNT_MM',
          'INCENTIVE_HOURS_NMM': 'INCENTIVE_HOURS_NMM',
          'INCENTIVE_HOURS_MM': 'INCENTIVE_HOURS_MM',
          'TREATMENT_PERCENT': 'TREATMENT_PERCENT',
          'PRODUCT_PERCENT_TIER_1': 'PRODUCT_PERCENT_TIER_1',
          'PRODUCT_PERCENT_TIER_2': 'PRODUCT_PERCENT_TIER_2',
          'PRODUCT_TARGET': 'PRODUCT_TARGET'
        };

        modifiedValues.push({
          category: categoryMap[key],
          value: currentValues[key]
        });
      }
    });

    // If no values were modified, exit early
    if (modifiedValues.length === 0) {
      this.isEditing = false;
      this.messageService.add({ severity: 'info', summary: 'No Changes', detail: 'No values were modified.' });
      return;
    }

    this.commissionSettingService.updateOptionValues(modifiedValues).subscribe({
      next: () => {
        this.isEditing = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Commission settings updated successfully!' });
        // Reload the settings to refresh original values
        this.loadCommissionSettings();
      },
      error: (error) => {
        console.error('Error updating commission settings:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update commission settings' });
      }
    });
  }
}
