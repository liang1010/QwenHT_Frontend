import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManageOptionValuesRoutingModule } from './manage-option-values-routing.module';
import { ManageOptionValuesComponent } from './manage-option-values.component';
import { PrimeNgModule } from '../primeng.module';
import { AccordionModule } from 'primeng/accordion';

@NgModule({
  declarations: [
    ManageOptionValuesComponent
  ],
  imports: [
    CommonModule,
    PrimeNgModule,
    ManageOptionValuesRoutingModule,
    AccordionModule
  ]
})
export class ManageOptionValuesModule { }
