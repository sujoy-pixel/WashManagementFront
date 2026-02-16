import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-empty-page',
    templateUrl: './empty-page.component.html',
    styleUrls: ['./empty-page.component.scss'],
    standalone: false
})
export class EmptyPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
