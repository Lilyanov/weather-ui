import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthorizationService } from './authorization.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorizationGuardService implements CanActivate {

  constructor(private authService: AuthorizationService, private router: Router) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    // If the current user is already authenticated, then return true
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // If the current user is not authenticated, then redirect them to the login screen
    this.router.navigate(['/login']);
    return false;
  }

}
