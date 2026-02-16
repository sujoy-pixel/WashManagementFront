import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

// Removed MatAccordion unless you are actually using Material expansion panels elsewhere in the same HTML

@Component({
    selector: 'app-accordions',
    templateUrl: './accordions.component.html',
    styleUrls: ['./accordions.component.scss'],
    standalone: false
})
// @NgModule({
//   declarations: [
//     AccordionsComponent
//   ],
//   imports: [
//     CommonModule,
//     NgbAccordionModule,  // <-- add this
//   ]
// })
export class AccordionsComponent implements OnInit {

  // Use these properties to toggle classes in HTML using [class.collapsed]
  public isFirstGradient = false;
  public isSecondGradient = false;
  openPanels: string[] = ['panel1', 'panel2', 'panel3'];

  constructor() { }

  ngOnInit(): void { }

  // Improved toggle logic without document.querySelector
  FirstGradient() {
    this.isFirstGradient = !this.isFirstGradient;
  }

  SecondGradient() {
    this.isSecondGradient = !this.isSecondGradient;
  }

  // Logic for Material Accordion (if you still have one in the HTML)
  step = 0;
  setStep(index: number) { this.step = index; }
  nextStep() { this.step++; }
  prevStep() { this.step--; }

  openAll() {
    this.openPanels = ['panel1', 'panel2', 'panel3']; // all panel IDs
  }
  closeAll() {
    this.openPanels = []; // collapse all
  }
}
