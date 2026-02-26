import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { QcInspectionComponent } from '../qc-inspection/qc-inspection.component';

@Component({
  selector: 'app-qc-profile',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, FormsModule, QcInspectionComponent],
  templateUrl: './qc-profile.component.html',
  styleUrl: './qc-profile.component.scss'
})
export class QcProfileComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>(); 
  showInspectionModal: boolean = false;

  handleClose() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
  openInspection() {
    //console.log('Opening QC Inspection Modal...');
     setTimeout(() => {
        this.showInspectionModal = true;
      }, 200);   
  }

  onDialogHide() {
  this.visible = false;
  this.visibleChange.emit(this.visible);
}
}
