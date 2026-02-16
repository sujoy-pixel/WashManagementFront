import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-error-layout',
    templateUrl: './error-layout.component.html',
    styleUrls: ['./error-layout.component.scss'],
    standalone: false
})
export class ErrorLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    document.querySelector('body')?.classList.remove('horizontal');
  }

}
