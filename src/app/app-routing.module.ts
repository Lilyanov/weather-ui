import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GraphViewComponent } from './views/graph-view/graph-view.component';
import { LoginComponent, DeviceViewComponent } from './views';
import { AuthorizationGuardService } from './services/authorization-guard.service';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'graph-view',  component: GraphViewComponent,  canActivate: [AuthorizationGuardService]  },
  { path: 'device-view',  component: DeviceViewComponent,  canActivate: [AuthorizationGuardService]  },
  { path: '', redirectTo: '/login', pathMatch: 'full' } // default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
