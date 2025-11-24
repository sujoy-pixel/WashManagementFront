import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  // heart rating
  currentRate = 2.5

  //  Control Enable
  ctrl = new FormControl(null, Validators.required);

  toggle() {
    if (this.ctrl.disabled) {
      this.ctrl.enable();
    } else {
      this.ctrl.disable();
    }
  }
  //Events and readonly ratings
  selected = 0;
  hovered = 0;
  readonly = false;

  
// ngx-bar-rating
  horiRate = 7;
  vertRate = 1;
  squareRate = 3;
  StatusRate = 2;
  customRate = 2;
  starRate = 4;
}
