import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import * as Views from './views';
import * as Components from './components';
import { TimeseriesService } from './services/timeseries.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthorizationService } from './services/authorization.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthorizationGuardService } from './services/authorization-guard.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { FormsModule } from '@angular/forms';
import { SuiModule } from 'ng2-semantic-ui';
import { DevicesService } from './services/devices.service';

const VIEWS = [Views.GraphViewComponent, Views.LoginComponent, Views.DeviceViewComponent];
const COMPONENTS = [Components.TopBarComponent];


@NgModule({
  declarations: [
    AppComponent,
    ...VIEWS, ...COMPONENTS 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ChartsModule,
    FormsModule,
    SuiModule
  ],
  providers: [
    TimeseriesService,
    DevicesService,
    AuthorizationService,
    CookieService,
    AuthorizationGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
