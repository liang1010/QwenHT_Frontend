import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavigationListComponent } from './navigation-list/navigation-list.component';

const routes: Routes = [
  {
    path: '',
    component: NavigationListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavigationRoutingModule { }