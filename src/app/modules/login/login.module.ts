import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { PrimeNgModule } from '../primeng.module';

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    PrimeNgModule
  ],
  declarations: [LoginComponent]
})
export class LoginModule { }
