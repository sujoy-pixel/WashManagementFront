import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-qc-dashboard',
  standalone: true,
  imports: [CommonModule,ButtonModule],
  templateUrl: './qc-dashboard.component.html',
  styleUrl: './qc-dashboard.component.scss'
})
export class QcDashboardComponent {
  defects: any[] = [
    { id: 1, name: 'Defect 1', description: 'Description of Defect 1' },
    { id: 2, name: 'Defect 2', description: 'Description of Defect 2' },
    { id: 3, name: 'Defect 3', description: 'Description of Defect 3' },
    { id: 4, name: 'Defect 4', description: 'Description of Defect 4' },
    { id: 5, name: 'Defect 5', description: 'Description of Defect 5' }
  ];
}
