import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qc-operation',
  standalone: true,
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './qc-operation.component.html',
  styleUrl: './qc-operation.component.scss'
})
export class QcOperationComponent {
  visible: boolean = false;
  loginData = {
    employeeId: '',
    password: ''
  };
  showDialog() {
    this.visible = true;
  }

  login() {
      console.log('Login Form Data:', this.loginData);
        // console.log('ID:', this.loginData.employeeId);
        
        //  this.visible = false; // লগইন সফল হলে মোডাল বন্ধ হবে
        
        // this.loginData = { employeeId: '', password: '' };
  }
}
