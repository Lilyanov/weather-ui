import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public user: User = new User('', '');
  public errorMessage: string;

  constructor(private authorizationService: AuthorizationService, private router: Router) { }

  public ngOnInit() {
    if (this.authorizationService.isAuthenticated()) {
      this.router.navigate(['/graph-view']);
    }
  }

  public login() {
    this.authorizationService.login(this.user).subscribe(
      (user: User) => {
        this.authorizationService.setJWT(user);
        this.errorMessage = '';
        this.router.navigate(['/graph-view']);
      },
      (error_response: any) => {
        this.errorMessage = error_response.error;
      }
    );;
  }

}
