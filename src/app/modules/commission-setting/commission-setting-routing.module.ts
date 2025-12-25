import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommissionSettingComponent } from './commission-setting.component';

const routes: Routes = [
   {
      path: '',
      component: CommissionSettingComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommissionSettingRoutingModule { }
