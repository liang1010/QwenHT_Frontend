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
        loadChildren: () => import('./modules/landing/landing.module').then(m => m.LandingModule), title: 'Monster S'
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            canActivate: [LoggedInGuard],
            loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule), title: 'Monster S - Login'
          }]
      },
      {
        path: 'app',
        component: AppLayoutComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'dashboard',
            loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule), title: 'Monster S - Dashboard'
          }, {
            path: 'commission',
            children: [
              {
                path: 'therapist',
                loadChildren: () => import('./modules/therapist-commission/therapist-commission.module').then(m => m.TherapistCommissionModule), title: 'Monster S - Commission Therapist'
              },
              {
                path: 'consultant',
                loadChildren: () => import('./modules/consultant-commission/consultant-commission.module').then(m => m.ConsultantCommissionModule), title: 'Monster S - Commission Consultant'
              },
              {
                path: 'setting',
                loadChildren: () => import('./modules/commission-setting/commission-setting.module').then(m => m.CommissionSettingModule), title: 'Monster S - Commission Settings'
              }]
          }, {
            path: 'payout',
            children: [
              {
                path: 'therapist',
                loadChildren: () => import('./modules/therapist-payout/therapist-payout.module').then(m => m.TherapistPayoutModule), title: 'Monster S - Payout Therapist'
              },
              {
                path: 'consultant',
                loadChildren: () => import('./modules/consultant-payout/consultant-payout.module').then(m => m.ConsultantPayoutModule), title: 'Monster S - Payour Consultant'
              }]
          },
          {
            path: 'sales',
            children: [
              {
                path: 'key-in',
                loadChildren: () => import('./modules/sales-key-in/sales-key-in.module').then(m => m.SalesModule), title: 'Monster S - Sales Key In'
              },
              {
                path: 'inquiry',
                loadChildren: () => import('./modules/sales-inquiry/sales-inquiry.module').then(m => m.SalesInquiryModule), title: 'Monster S - Sales Inquiry'
              },
              {
                path: 'summary',
                loadChildren: () => import('./modules/sales-summary/sales-summary.module').then(m => m.SalesSummaryModule), title: 'Monster S - Sales Summary'
              }
            ]
          },
          {

            path: 'manage',
            children: [
              {
                path: 'user',
                loadChildren: () => import('./modules/manage-user/manage-user.module').then(m => m.ManageUserModule), title: 'Monster S - Manage Users'
              },
              {
                path: 'staff',
                loadChildren: () => import('./modules/manage-staff/manage-staff.module').then(m => m.ManageStaffModule), title: 'Monster S - Manage Staffs'
              },
              {
                path: 'menus',
                loadChildren: () => import('./modules/manage-menus/manage-menus.module').then(m => m.ManageMenusModule), title: 'Monster S - Manage Menus'
              },
              {
                path: 'navigation',
                loadChildren: () => import('./modules/navigation/navigation.module').then(m => m.NavigationModule), title: 'Monster S - Manage Navigations'
              },
              {
                path: 'option-values',
                loadChildren: () => import('./modules/manage-option-values/manage-option-values.module').then(m => m.ManageOptionValuesModule), title: 'Monster S - Manage Option Values'
              },
              {
                path: 'role',
                loadChildren: () => import('./modules/manage-roles/manage-roles.module').then(m => m.ManageRolesModule), title: 'Monster S - Manage Roles'
              },
            ]
          },
          {
            path: 'notfound',
            component: AppNotfoundComponent, title: 'Monster S - Not Found'
          }

        ]
      },
      { path: 'notfound', component: AppNotfoundComponent, title: 'Monster S - Not Found' },
      { path: '**', redirectTo: '/notfound' },
    ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
