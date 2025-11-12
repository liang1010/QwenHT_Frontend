import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './private/core/guards/auth.guard';
import { PublicLayoutComponent } from './public/public-layout.component';
import { PrivateLayoutComponent } from './private-layout.component';

const routes: Routes = [
  // Public routes
  {
    path: '',
    component: PublicLayoutComponent,
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule)
  },
  // Auth routes
  {
    path: 'auth',
    component: PublicLayoutComponent,
    loadChildren: () => import('./private/features/auth/auth.module').then(m => m.AuthModule)
  },
  // Private area routes (authentication required) - wrapped in single layout
  {
    path: '',
    component: PrivateLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./private/features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./private/features/users/users.module').then(m => m.UsersModule)
      }
    ]
  },
  // Default redirect
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'signin-callback', redirectTo: '/dashboard' },
  { path: '**', redirectTo: '/home' }  // Wildcard route for 404 pages
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }