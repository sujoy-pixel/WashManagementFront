import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.scss'],
})
export class Error404Component implements OnInit {
  constructor() {
    document.querySelector('body')?.classList.add('error-bg');
    document.querySelector('body')?.classList.remove('layout-boxed')
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    document.querySelector('body')?.classList.remove('error-bg');
  }
}
