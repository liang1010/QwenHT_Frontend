import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { ManageRolesComponent } from './manage-roles.component';
import { ManageRolesRoutingModule } from './manage-roles-routing.module';

@NgModule({
  declarations: [
    ManageRolesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ManageRolesRoutingModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ToolbarModule,
    DialogModule,
    ConfirmDialogModule,
    DropdownModule,
    InputNumberModule,
    CheckboxModule,
    MultiSelectModule,
    CalendarModule
  ]
})
export class ManageRolesModule { }