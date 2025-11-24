import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lockscreen',
  templateUrl: './lockscreen.component.html',
  styleUrls: ['./lockscreen.component.scss'],
})
export class LockscreenComponent implements OnInit {
  constructor() {
    document.querySelector('body')?.classList.add('login-img');
    document.querySelector('body')?.classList.remove('layout-boxed')
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    document.querySelector('body')?.classList.remove('login-img');
  }
}
