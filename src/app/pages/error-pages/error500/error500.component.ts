import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error500',
  templateUrl: './error500.component.html',
  styleUrls: ['./error500.component.scss'],
})
export class Error500Component implements OnInit {
  constructor() {
    document.querySelector('body')?.classList.add('error-bg');
    document.querySelector('body')?.classList.remove('layout-boxed')
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    document.querySelector('body')?.classList.remove('error-bg');
  }
}
