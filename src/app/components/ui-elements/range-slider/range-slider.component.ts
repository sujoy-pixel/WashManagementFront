import { LabelType, Options } from '@angular-slider/ngx-slider';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.scss']
})
export class RangeSliderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  // thumbLabel Angular material
  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }

  //
  value: number = 123;
  options: Options = {
    floor: 0,
    ceil: 250
  };
  //
  value1: number = 40;
  highValue1: number = 60;
  options1: Options = {
    floor: 0,
    ceil: 100
  };

  // 
  value2: number = 5;
  options2: Options = {
    showTicksValues: true,
    stepsArray: [
      { value: 1, legend: "Very poor" },
      { value: 2 },
      { value: 3, legend: "Fair" },
      { value: 4 },
      { value: 5, legend: "Average" },
      { value: 6 },
      { value: 7, legend: "Good" },
      { value: 8 },
      { value: 9, legend: "Excellent" }
    ]
  };
  //
  minValue3: number = 100;
  maxValue3: number = 400;
  options3: Options = {
    floor: 0,
    ceil: 500,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return "<b>Min price:</b> $" + value;
        case LabelType.High:
          return "<b>Max price:</b> $" + value;
        default:
          return "$" + value;
      }
    }
  };
  //
  minValue4: number = 60;
  maxValue4: number = 70;
  options4: Options = {
    floor: 0,
    ceil: 100,
    step: 1,
    minRange: 10,
    maxRange: 30,
    pushRange: true
  };
  //Slider with visible selection bar at the end 
  value5: number = 5;
  options5: Options = {
    floor: 0,
    ceil: 10,
    showSelectionBarEnd: true
  };
  //Slider with visible selection bar from specified value
  value6: number = 5;
  options6: Options = {
    floor: -10,
    ceil: 10,
    showSelectionBarFromValue: 0
  };
  //Slider with selection bar gradient
  value7: number = 12;
  options7: Options = {
    floor: 0,
    ceil: 12,
    showSelectionBar: true,
    getSelectionBarColor: (value: number): string => {
      if (value <= 3) {
          return 'red';
      }
      if (value <= 6) {
          return 'orange';
      }
      if (value <= 9) {
          return 'yellow';
      }
      return '#2AE02A';
    }
  };
  // Slider with floating point values
  value8: number = 0.5;
  options8: Options = {
    floor: 0,
    ceil: 2,
    step: 0.1
  };
}
