import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppNotfoundComponent } from './layout/app-notfound/app-notfound.component';
import { AppLayoutModule } from './layout/app-layout/app.layout.module';
import { JwtModule } from '@auth0/angular-jwt';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { ProgressBarModule } from 'primeng/progressbar';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AppComponent,
    AppNotfoundComponent
  ],
  imports: [
    AppRoutingModule,
    AppLayoutModule,
    ProgressBarModule,
    BrowserModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:5001'], // Update with your API domain
        disallowedRoutes: []
      }
    })
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
