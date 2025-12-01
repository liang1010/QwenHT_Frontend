import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManageMenusRoutingModule } from './manage-menus-routing.module';
import { ManageMenusComponent } from './manage-menus.component';
import { PrimeNgModule } from '../primeng.module';

@NgModule({
  declarations: [
    ManageMenusComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ManageMenusRoutingModule,
    PrimeNgModule
  ]
})
export class ManageMenusModule { }