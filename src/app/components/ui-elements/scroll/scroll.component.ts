import { Component, OnInit } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
  selector: 'app-scroll',
  templateUrl: './scroll.component.html',
  styleUrls: ['./scroll.component.scss']
})
export class ScrollComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    let content:any = document.querySelector('.content');
    let content1:any = document.querySelector('.content-1');

    let ps = new PerfectScrollbar(content);
    let ps1 = new PerfectScrollbar(content1,{wheelPropagation: false});
  }
}
