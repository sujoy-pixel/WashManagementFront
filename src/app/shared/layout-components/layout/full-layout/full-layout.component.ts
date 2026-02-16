import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-full-layout',
    templateUrl: './full-layout.component.html',
    styleUrls: ['./full-layout.component.scss'],
    standalone: false
})
export class FullLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    document.querySelector('body')?.classList.remove('horizontal');
  }

}
