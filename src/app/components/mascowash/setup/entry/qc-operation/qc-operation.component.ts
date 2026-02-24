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
  showLoginModal: boolean = false;
  showProfileModal: boolean = false;

  loginData = {
    employeeId: '',
    password: ''
  };
  showLoginDialog() {
    this.showLoginModal = true;
  }
// ID:18200   Pass:sam2311
  login() {
      console.log('Login Form Data:', this.loginData);
    if (this.loginData.employeeId === '18200' && this.loginData.password === 'sam2311') {
      console.log('Login Successful!');
      
      this.showLoginModal = false; 
     // this.showProfileModal = true; 

      setTimeout(() => {
        this.showProfileModal = true;
      }, 200);   
      
      this.loginData = { employeeId: '', password: '' };
    } else {
      alert('Invalid Employee ID or Password!'); 
    }
      
  }
}
