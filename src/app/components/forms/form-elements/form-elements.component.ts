import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ColorPickerService } from 'ngx-color-picker';

@Component({
  selector: 'app-form-elements',
  templateUrl: './form-elements.component.html',
  styleUrls: ['./form-elements.component.scss']
})
export class FormElementsComponent implements OnInit {
  public color: string = '#2889e9';
  public color13: string = 'rgba(0,255,0,0.5)';
  public rgbaText: string = 'rgba(165, 26, 214, 0.2)';
  public color16: string = '#a51ad633';
  constructor(private cpService: ColorPickerService) { }

  ngOnInit(): void {
    
  }

  public onChangeColorHex8(color: string): string {
    const hsva = this.cpService.stringToHsva(color, true);

    if (hsva) {
      return this.cpService.outputFormat(hsva, 'rgba', null);
    }

    return '';
  }

  //range-input slider
  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }

  autoTicks = false;
  disabled = false;
  invert = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value = 0;
  vertical = false;
  tickInterval = 1;

  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }

    return 0;
  }

  form: FormGroup = new FormGroup({
    tel: new FormControl(new MyTel('', '', '')),
  });
}

/** Data structure for holding telephone number. */
export class MyTel {
  constructor(public area: string, public exchange: string, public subscriber: string) {}
}
