import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { WashSetupService } from '../../../services/washsetup.service';
import { CommonServiceService } from '../../../services/common-service';
import { NgZone } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fault-wise-value-tag-entry',
  templateUrl: './fault-wise-value-tag-entry.component.html',
  styleUrls: ['./fault-wise-value-tag-entry.component.scss'],
})
export class FaultWiseValueTagEntryComponent {
  model: any = null;
  // toastr: any;
  numbers: number[] = [];
  saveButtonTitle = 'Save';
  currentFocus: string | null = null;

  priorityList: number[] = [];
  dataList: any[] = [];
  isEdit = false;
  isSubmitting = false;

  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  Model: any = {
    falutType: null,
    inspectionHead: null,
    faultHead: null,
    faultWiseTagId: null,
  };

  async ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.GetFaultHeadList().subscribe({
      next: (res: any) => {
        console.log('dataList:', res);
        this.dataList = res ?? [];
      },
      error: () => {
        this.toastr.error('Failed to load Fault Head data');
      },
    });
  }
}
