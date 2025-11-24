import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/firebase/auth.service';

@Component({
  selector: 'app-resister',
  templateUrl: './resister.component.html',
  styleUrls: ['./resister.component.scss']
})
export class ResisterComponent implements OnInit {

  constructor(public authService: AuthService ) { 
    document.querySelector('body')?.classList.add('login-img');
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    document.querySelector('body')?.classList.remove('login-img');
  }
}
