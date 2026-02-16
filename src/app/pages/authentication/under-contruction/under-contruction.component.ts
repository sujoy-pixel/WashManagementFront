import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-under-contruction',
    templateUrl: './under-contruction.component.html',
    styleUrls: ['./under-contruction.component.scss'],
    standalone: false
})
export class UnderContructionComponent implements OnInit {

  constructor() { 
    document.querySelector('body')?.classList.add('login-img')
    document.querySelector('body')?.classList.remove('layout-boxed')
  }

  ngOnInit(): void {
  }

  ngOnDestroy(){
    document.querySelector('body')?.classList.remove('login-img')
  }
}
