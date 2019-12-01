import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthorizationService } from '../services/authorization.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthorizationService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      setHeaders: {'Authorization': `Bearer ${this.authService.getJWT()}`},
    });

    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
          if (event instanceof HttpErrorResponse) {
              this.authService.logout();
          }
          return event;
      }));
  }
}
