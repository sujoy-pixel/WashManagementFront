import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { WashSetupService } from '../../../../../services/washsetup.service';
import { CommonServiceService } from '../../../../../services/common-service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from '@angular/forms';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
@Component({
  selector: 'app-qc-dashboard',
  standalone: true,
  imports: [CommonModule,ButtonModule,FormsModule],
  templateUrl: './qc-dashboard.component.html',
  styleUrl: './qc-dashboard.component.scss'
})

export class QcDashboardComponent {
  
  batchNo: string = '';

  goodGarments: number = 0;
  repairable: number = 0;
  reject: number = 0;

  loading: boolean = false;

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}


  loadBatchData() {
   debugger;
    if (!this.batchNo || this.batchNo.trim() === '')
      return;

    this.loading = true;

    this.service.getBatchWishQCDataList(this.batchNo)
      .subscribe({
        next: (res: any[]) => {

          if (!res || res.length === 0) {
            this.resetValues();
            return;
          }

          const data = res[0]; 

         
          this.goodGarments = data.GoodGarments || 0;
          this.repairable   = data.Repairable || 0;
          this.reject       = data.Reject || 0;

        },
        error: (err) => {
          console.error(err);
          this.resetValues();
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  resetValues() {
    this.goodGarments = 0;
    this.repairable = 0;
    this.reject = 0;
  }

  // defects: any[] = [
  //   { id: 1, name: 'Defect 1', description: 'Description of Defect 1' },
  //   { id: 2, name: 'Defect 2', description: 'Description of Defect 2' },
  //   { id: 3, name: 'Defect 3', description: 'Description of Defect 3' },
  //   { id: 4, name: 'Defect 4', description: 'Description of Defect 4' },
  //   { id: 5, name: 'Defect 5', description: 'Description of Defect 5' }
  // ];
}
