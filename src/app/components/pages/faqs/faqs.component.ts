
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap'; // Import the module

@Component({
  selector: 'app-faqs',
  standalone: true, // If you are using standalone mode
  imports: [NgbAccordionModule], // Add it here
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {
  constructor() { }
  ngOnInit(): void { }
}