import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from 'src/app/services/authorization.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {

  constructor(public authorizationService: AuthorizationService) { }

  public ngOnInit() {
  }

  public logout() {
    this.authorizationService.logout();
  }

}
