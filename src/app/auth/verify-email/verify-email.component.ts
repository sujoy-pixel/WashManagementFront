import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/firebase/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {

  constructor(public authService: AuthService, private _location: Location) { 
    document.querySelector('body')?.classList.add('login-img');
  }

  ngOnInit(): void {
  }
  backClicked() {
    this._location.back();
  }
  ngOnDestroy() {
    document.querySelector('body')?.classList.remove('login-img');
  }
}
