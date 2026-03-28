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
  isShowRepairableDialog: boolean = false
  loading: boolean = false;
  selectedRejects: any[] = [];
  selectedRepairable: any[] = [];
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
  // defects: any[] = [
  //   { id: 1, name: 'Defect 1', description: 'Description of Defect 1' },
  //   { id: 2, name: 'Defect 2', description: 'Description of Defect 2' },
  //   { id: 3, name: 'Defect 3', description: 'Description of Defect 3' },
  //   { id: 4, name: 'Defect 4', description: 'Description of Defect 4' },
  //   { id: 5, name: 'Defect 5', description: 'Description of Defect 5' }
  // ];
showRepairableDialog() {

    // Logic to show the repairable dialog
    console.log('Show repairable dialog');
     this.isShowRepairableDialog = true;
  }

  ondDefectConfirm(data:any[])
{
  console.log('RShow repairable dialog:', data);
debugger;
  this.selectedRepairable = data;

  // total reject calculate
  this.reject = data.reduce((sum,x)=> sum + x.count ,0);
}

handleReparableData(data: any[]) {

  console.log('Child Data:', data);

  // bind child data to repairable list
  this.repairableDefects = data;
   // this.rejectDefects = data;

  // calculate total reject
  this.reject = data.reduce((sum, x) => sum + x.count, 0);

  this.isShowRepairableDialog = false;
}

  showRejectionDialog() {

    // Logic to show the rejection dialog
    console.log('Show rejection dialog');
    this.isShowRejectionDialog = true;
  }


  onRejectConfirm(data:any[])
{
  console.log('Reject Data From Dialog:', data);
debugger;
  this.selectedRejects = data;

  // total reject calculate
  this.reject = data.reduce((sum,x)=> sum + x.count ,0);
}



  repairableDefects: any[] = [
    // { id: 1, name: 'Repairable Defect 1', description: 'Description of Repairable Defect 1', count: 10 },
    // { id: 2, name: 'Repairable Defect 2', description: 'Description of Repairable Defect 2', count: 5 },
    // { id: 3, name: 'Repairable Defect 3', description: 'Description of Repairable Defect 3', count: 8 },
    // { id: 4, name: 'Repairable Defect 4', description: 'Description of Repairable Defect 4', count: 12 },
    // { id: 5, name: 'Repairable Defect 5', description: 'Description of Repairable Defect 5', count: 7 }
  ];


  rejectDefects: any[] = [];

handleRejectionData(data: any[]) {

  console.log('Child Data:', data);

  // bind child data to reject list
  this.rejectDefects = data;

  // calculate total reject
  this.reject = data.reduce((sum, x) => sum + x.count, 0);

  this.isShowRejectionDialog = false;

}
  // rejectDefects: any[] = [
    
    // { id: 1, name: 'Reject Defect 1', description: 'Description of Reject Defect 1', count: 15 },
    // { id: 2, name: 'Reject Defect 2', description: 'Description of Reject Defect 2', count: 8 },
    // { id: 3, name: 'Reject Defect 3', description: 'Description of Reject Defect 3', count: 12 },
    // { id: 4, name: 'Reject Defect 4', description: 'Description of Reject Defect 4', count: 5 },
    // { id: 5, name: 'Reject Defect 5', description: 'Description of Reject Defect 5', count: 10 }
  // ];

  // handleRejectionData(data: any) {
  //   debugger;
  //   console.log('Child Data:', data);
  //   this.isShowRejectionDialog = false; 
  // }
}
