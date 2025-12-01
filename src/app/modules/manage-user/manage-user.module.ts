import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageUserRoutingModule } from './manage-user-routing.module';
import { ManageUserComponent } from './manage-user.component';
import { PrimeNgModule } from '../primeng.module';


@NgModule({
  declarations: [ManageUserComponent],
  imports: [
    CommonModule,
    ManageUserRoutingModule,
    PrimeNgModule
  ]
})
export class ManageUserModule { }
