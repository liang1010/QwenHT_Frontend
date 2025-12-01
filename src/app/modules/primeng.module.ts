import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ChartModule } from 'primeng/chart';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { BadgeModule } from 'primeng/badge';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SidebarModule } from 'primeng/sidebar';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { AutoCompleteModule } from "primeng/autocomplete";

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    MessagesModule,
    DialogModule,
    TableModule,
    TreeTableModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    DropdownModule,
    RadioButtonModule,
    InputNumberModule,
    ChartModule,
    MenuModule,
    StyleClassModule,
    PanelMenuModule,
    DividerModule,
    PanelModule,
    SidebarModule,
    BadgeModule,
    InputSwitchModule,
    ProgressSpinnerModule,
    TagModule,
    MultiSelectModule,
    ConfirmDialogModule,
		CalendarModule,
    TabViewModule,
		AutoCompleteModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    MessagesModule,
    DialogModule,
    TableModule,
    TreeTableModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    DropdownModule,
    RadioButtonModule,
    InputNumberModule,
    ChartModule,
    MenuModule,
    StyleClassModule,
    PanelMenuModule,
    DividerModule,
    PanelModule,
    SidebarModule,
    BadgeModule,
    InputSwitchModule,
    ProgressSpinnerModule,
    TagModule,
    MultiSelectModule,
    DynamicDialogModule,
    ConfirmDialogModule,
		CalendarModule,
    TabViewModule,
		AutoCompleteModule,
  ]
})
export class PrimeNgModule { }
