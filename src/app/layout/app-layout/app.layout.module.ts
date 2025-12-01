import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppFooterComponent } from '../app-footer/app-footer.component';
import { AppMenuComponent } from '../app-menu/app-menu.component';
import { AppMenuitemComponent } from '../app-menuitem/app-menuitem.component';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';
import { AppLayoutComponent } from './app-layout.component';
import { AppTopBarComponent } from '../app-topbar/app-topbar.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PrimeNgModule } from '../../modules/primeng.module';
import { DialogService } from 'primeng/dynamicdialog';
import { AppChangePasswordDialogComponent } from '../app-change-password-dialog/app-change-password-dialog.component';

@NgModule({
  declarations: [
    AppChangePasswordDialogComponent,
    AppMenuitemComponent,
    AppTopBarComponent,
    AppFooterComponent,
    AppMenuComponent,
    AppSidebarComponent,
    AppLayoutComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    PrimeNgModule,
  ],
  exports: [AppLayoutComponent, PrimeNgModule],
  providers: [MessageService, DialogService, ConfirmationService]
})
export class AppLayoutModule { }
