import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationRoutingModule } from './navigation-routing.module';
import { NavigationListComponent } from './navigation-list/navigation-list.component';
import { NavigationFormComponent } from './navigation-form/navigation-form.component';
import { NavigationRoleFormComponent } from './navigation-role-form/navigation-role-form.component';
import { PrimeNgModule } from '../../modules/primeng.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    NavigationListComponent,
    NavigationFormComponent,
    NavigationRoleFormComponent
  ],
  imports: [
    CommonModule,
    NavigationRoutingModule,
    PrimeNgModule,
    ReactiveFormsModule
  ],
  providers: [

  ]
})
export class NavigationModule { }
