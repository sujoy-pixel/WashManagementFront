import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sigin',
  templateUrl: './sigin.component.html',
  styleUrls: ['./sigin.component.scss']
})
export class SiginComponent implements OnInit {

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
