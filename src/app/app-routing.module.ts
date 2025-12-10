import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppNotfoundComponent } from './layout/app-notfound/app-notfound.component';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { LoggedInGuard } from './guards/logged-in.guard';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: '',
        loadChildren: () => import('./modules/landing/landing.module').then(m => m.LandingModule),
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            canActivate: [LoggedInGuard],
            loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule)
          }]
      },
      {
        path: 'app',
        component: AppLayoutComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'dashboard',
            loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
          },
          {
            path: 'sales',
            loadChildren: () => import('./modules/sales/sales.module').then(m => m.SalesModule)
          },
          {
            path: 'inquiry-sales',
            loadChildren: () => import('./modules/inquiry-sales/inquiry-sales.module').then(m => m.InquirySalesModule)
          },
          {

            path: 'manage',
            children: [
              {
                path: 'user',
                loadChildren: () => import('./modules/manage-user/manage-user.module').then(m => m.ManageUserModule)
              },
              {
                path: 'staff',
                loadChildren: () => import('./modules/manage-staff/manage-staff.module').then(m => m.ManageStaffModule)
              },
              {
                path: 'menus',
                loadChildren: () => import('./modules/manage-menus/manage-menus.module').then(m => m.ManageMenusModule)
              },
              {
                path: 'navigation',
                loadChildren: () => import('./modules/navigation/navigation.module').then(m => m.NavigationModule)
              },
              {
                path: 'option-values',
                loadChildren: () => import('./modules/manage-option-values/manage-option-values.module').then(m => m.ManageOptionValuesModule)
              },
              {
                path: 'role',
                loadChildren: () => import('./modules/manage-roles/manage-roles.module').then(m => m.ManageRolesModule)
              },
            ]
          },
          {
            path: 'login',
            loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule)
          },
          {
            path: 'landing',
            loadChildren: () => import('./modules/landing/landing.module').then(m => m.LandingModule)
          },
          {
            path: 'notfound',
            component: AppNotfoundComponent
          }

        ]
      },
      { path: 'notfound', component: AppNotfoundComponent },
      { path: '**', redirectTo: '/notfound' },
    ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
