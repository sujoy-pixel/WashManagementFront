import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { QcProfileComponent } from './components/qc-profile/qc-profile.component';
import { QcInspectionComponent } from './components/qc-inspection/qc-inspection.component';


@Component({
  selector: 'app-qc-operation',
  standalone: true,
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule, QcProfileComponent, QcInspectionComponent],
  templateUrl: './qc-operation.component.html',
  styleUrl: './qc-operation.component.scss'
})
export class QcOperationComponent {
  showProfileModal: boolean = false;
  showInspectionModal: boolean = false;

  showProfileDialog() {
      this.showProfileModal = true;
  }

  showInspectionDialog() {
    this.showInspectionModal = true;
  }
}
