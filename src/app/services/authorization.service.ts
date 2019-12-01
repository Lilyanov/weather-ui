import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { stringify } from 'querystring';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorizationService {

  private readonly COOKIE_NAME = 'auth_token';
  private readonly USER = 'user';

  public authorized = false;
  public user: User;

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) {
    this.authorized = this.isAuthenticated();
    this.user = this.getUser();
  }

  public isAuthenticated(): boolean {
    const token = this.getJWT()
    if (!token) {
      return false;
    }
    return this.isJWTValid(token);
  }

  public login(user: User): Observable<User> {
    return this.http.post<User>(environment.apiHost + "/auth/get-token", user);
  }

  public logout() {
    this.cookieService.delete(this.COOKIE_NAME);
    localStorage.removeItem(this.USER);
    this.authorized = false;
    this.router.navigate(['/login']);
  }

  public getJWT(): string {
    // Check if we have the value cached
    return this.cookieService.get(this.COOKIE_NAME);
  }

  public getUser(): User {
    return JSON.parse(localStorage.getItem(this.USER));
  }

  public setJWT(user: User) {
    this.authorized = true;
    this.cookieService.set(this.COOKIE_NAME, user.token, this.getExpiryDate(user.token));
    user.token = '';
    localStorage.setItem(this.USER, JSON.stringify(user))
    this.user = user;
  }

  private isJWTValid(token: string): boolean {
    const notExpired = !this.hasExpired(token);
    const hasUserId = this.getTokenPayload(token).username != null;
    return notExpired && hasUserId;
  }

  private hasExpired(token: string): boolean {
    const expiryDate = this.getExpiryDate(token);
    const now = new Date();
    const hasExpired = expiryDate < now;
    if (hasExpired) {
      console.log('Warning: JWT Token has expired.', expiryDate);
    }
    return hasExpired;
  }

  private getExpiryDate(token: string): Date {
    const payload = this.getTokenPayload(token);
    const expiry = new Date(parseInt(payload.exp, 10) * 1000, );
    return expiry;
  }

  private getTokenPayload(token: string) {
    if (!token || token.length === 0) {
      return {};
    }
    const tokenArr = token.split('.');
    const header = tokenArr[0];
    const body = tokenArr[1];
    const sig = tokenArr[2];
    const decodedBody = atob(body);
    const payload = JSON.parse(decodedBody);
    return payload;
  }

  private getCookie(cookieName: string): string {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieData = decodedCookie.split(';');
    let value = '';
    for (const datum of cookieData) {
      if (datum.trim().indexOf(cookieName + '=') >= 0) {
        value = datum.trim().substring(cookieName.length + 1);
      }
    }
    return value;
  }
}
