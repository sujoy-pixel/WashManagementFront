import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/firebase/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {

  constructor(public authService: AuthService) { 
    document.querySelector('body')?.classList.add('login-img');
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    document.querySelector('body')?.classList.remove('login-img');
  }
}
