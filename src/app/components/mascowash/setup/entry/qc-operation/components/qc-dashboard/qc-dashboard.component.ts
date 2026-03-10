import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { WashSetupService } from '../../../../../services/washsetup.service';
import { CommonServiceService } from '../../../../../services/common-service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from '@angular/forms';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RejectReasonComponent } from '../reject-reason/reject-reason.component';

@Component({
  selector: 'app-qc-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule, RejectReasonComponent],
  templateUrl: './qc-dashboard.component.html',
  styleUrl: './qc-dashboard.component.scss'
})

export class QcDashboardComponent {
  batchNo: string = '';
  goodGarments: number = 0;
  repairable: number = 0;
  reject: number = 0;
  isShowRejectionDialog: boolean = false;

  loading: boolean = false;

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }


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
          debugger;
          console.log('Batch QC Data:', res);
          const data = res[0];
          this.goodGarments = data.goodGarments ?? 0;
          //  data.goodGarments =this.goodGarments  ?? 0;
          // this.goodGarments = data.GoodGarments || 0;
          // this.repairable = data.Repairable || 0;
          // this.reject = data.Reject || 0;
          this.cleanTrackingNo();
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
  cleanTrackingNo() {
    this.batchNo = '';
  }
  resetValues() {
    this.goodGarments = 0;
    this.repairable = 0;
    this.reject = 0;
  }
  //goodGarments: number = 0;

  // ➕ increase
  increaseGood(): void {
    this.goodGarments++;
  }

  // ➖ decrease
  decreaseGood(): void {
    if (this.goodGarments > 0) {
      this.goodGarments--;
    }
  }
  defects: any[] = [
    { id: 1, name: 'Defect 1', description: 'Description of Defect 1' },
    { id: 2, name: 'Defect 2', description: 'Description of Defect 2' },
    { id: 3, name: 'Defect 3', description: 'Description of Defect 3' },
    { id: 4, name: 'Defect 4', description: 'Description of Defect 4' },
    { id: 5, name: 'Defect 5', description: 'Description of Defect 5' }
  ];

 
  showRejectionDialog() {

    // Logic to show the rejection dialog
    console.log('Show rejection dialog');
    this.isShowRejectionDialog = true;
  }
}
