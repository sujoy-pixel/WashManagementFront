import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qc-inspection',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, FormsModule],
  templateUrl: './qc-inspection.component.html',
  styleUrl: './qc-inspection.component.scss'
})
export class QcInspectionComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  mainModalVisible: boolean = false;
  isFullScreen: boolean = false;
  isMaximized: boolean = false;

  openMainOperation() {
    this.visible = false;
    this.mainModalVisible = true;
  }

  handleMaximize() {
    this.isMaximized = !this.isMaximized;
   // this.isFullScreen = false; 
  }
}
