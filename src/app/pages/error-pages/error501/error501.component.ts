import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error501',
  templateUrl: './error501.component.html',
  styleUrls: ['./error501.component.scss'],
})
export class Error501Component implements OnInit {
  constructor() {
    document.querySelector('body')?.classList.add('error-bg');
    document.querySelector('body')?.classList.remove('layout-boxed')
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    document.querySelector('body')?.classList.remove('error-bg');
  }
}
