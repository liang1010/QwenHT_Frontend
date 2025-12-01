import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageStaffRoutingModule } from './manage-staff-routing.module';
import { ManageStaffComponent } from './manage-staff.component';
import { PrimeNgModule } from '../primeng.module';

@NgModule({
  declarations: [
    ManageStaffComponent
  ],
  imports: [
    CommonModule,
    ManageStaffRoutingModule,
    PrimeNgModule
  ]
})
export class ManageStaffModule { }