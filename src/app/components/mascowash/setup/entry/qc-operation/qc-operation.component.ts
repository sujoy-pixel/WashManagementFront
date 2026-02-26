import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { QcProfileComponent } from './components/qc-profile/qc-profile.component';

@Component({
  selector: 'app-qc-operation',
  standalone: true,
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule, QcProfileComponent],
  templateUrl: './qc-operation.component.html',
  styleUrl: './qc-operation.component.scss'
})
export class QcOperationComponent {
  showProfileModal: boolean = false;

  showLoginDialog() {
    // /this.showLoginModal = true;
      this.showProfileModal = true;
  }
}
