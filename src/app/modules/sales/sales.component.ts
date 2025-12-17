import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesService, Staff, } from './sales.service';
import { OptionValue } from '../../models/option-value.model';
import { Menu } from '../../models/menu.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  salesForm: FormGroup;
  outlets: OptionValue[] = [];

  availableStaffList: Staff[] = [];
  filteredStaffList: Staff[] = [];

  availableMenuList: Menu[] = [];
  filteredMenuList: Menu[] = [];

  statusOptions = [
    { name: 'Inactive', value: 0 },
    { name: 'Active', value: 1 }
  ];

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private messageService: MessageService
  ) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    this.salesForm = this.fb.group({
      salesDate: [d, Validators.required],
      staffId: ['', Validators.required],
      outlet: ['', Validators.required],
      menuId: ['', Validators.required],
      request: [false],
      footCream: [false],
      oil: [false],
      price: [0, [Validators.required, Validators.min(0)]],
      bodyMins: [0],
      footMins: [0],
      extraCommission: [0],
      staffCommission: [0],
      remark: ['']
    });
  }

  ngOnInit(): void {
    this.salesForm.get('footMins')?.disable();
    this.salesForm.get('bodyMins')?.disable();
    this.loadData();

    // Subscribe to menu selection changes to populate price and commission
    this.salesForm.get('menuId')?.valueChanges.subscribe(menuId => {
      if (menuId) {
        this.populateMenuData(menuId);
      }
    });
  }

  loadData(): void {
    // Fetch all the required data from the backend
    this.salesService.getStaff().subscribe(data => {

      this.availableStaffList = data;
      this.filteredStaffList = [...this.availableStaffList];
    });

    this.salesService.getMenu().subscribe(data => {
      this.availableMenuList = data;
      this.filteredMenuList = [...this.availableMenuList];
    });

    this.salesService.getOutlets().subscribe(data => {
      this.outlets = data;
      this.outlets = this.outlets.filter(x => x.value != 'ALL');
    });
  }

  searchStaff(event: any) {
    // Filter the already-loaded options on the client side
    if (event.query && event.query.length >= 1) {
      const query = event.query.toLowerCase();
      this.filteredStaffList = this.availableStaffList.filter(nationality =>
        nationality?.nickName?.toLowerCase().includes(query)
      );
    } else {
      this.filteredStaffList = [...this.availableStaffList];
    }
  }

  searchMenu(event: any) {
    // Filter the already-loaded options on the client side
    if (event.query && event.query.length >= 1) {
      const query = event.query.toLowerCase();
      this.filteredMenuList = this.availableMenuList.filter(nationality =>
        nationality?.code?.toLowerCase().includes(query)
      );
    } else {
      this.filteredMenuList = [...this.availableMenuList];
    }
  }

  populateMenuData(selectedMenu: Menu): void {
    if (selectedMenu) {
      // Update the price and commission based on the selected menu
      this.salesForm.patchValue({
        price: selectedMenu.price,
        bodyMins: selectedMenu.bodyMins,
        footMins: selectedMenu.footMins,
        staffCommission: selectedMenu.staffCommission,
        extraCommission: selectedMenu.extraCommission
      });
    }
  }

  getSelectedStaffName(id: string | null): string {
    if (!id) return '';
    const staff = this.availableStaffList.find(s => s.id === id);
    return staff ? staff.nickName || staff.fullName : '';
  }

  getSelectedOutletName(value: string | null): string {
    if (!value) return '';
    const outlet = this.outlets.find(o => o.value === value);
    return outlet?.value ?? '';
  }

  getSelectedMenuName(id: string | null): string {
    if (!id) return '';
    const menu = this.availableMenuList.find(m => m.id === id);
    return menu?.description ?? '';
  }

  resetForm(): void {
    this.salesForm.get('menuId')?.reset();
    this.salesForm.get('extraCommission')?.reset();
    this.salesForm.get('staffCommission')?.reset();
    this.salesForm.get('footMins')?.reset();
    this.salesForm.get('bodyMins')?.reset();
    this.salesForm.get('price')?.reset();
    this.salesForm.patchValue({
      price: 0,
      bodyMins: 0,
      footMins: 0,
      staffCommission: 0,
      extraCommission: 0
    });
  }

  onSubmit(): void {
    if (this.salesForm.valid) {
      // Send the sales data to the backend
      this.salesService.saveSales(
        {
          ...this.salesForm.value,
          staffId: this.salesForm.get('staffId')?.value.id,
          menuId: this.salesForm.get('menuId')?.value.id,
        }).subscribe({
          next: (response) => {
            console.log('Sales saved successfully:', response);
            // Reset form after successful submission
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Sales Saved',
              life: 3000
            });
            this.resetForm();
          },
          error: (error) => {
            console.error('Error saving sales:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error saving sales',
              life: 3000
            });
          }
        });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.salesForm.controls).forEach(key => {
      const control = this.salesForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      }
    });
  }
}
