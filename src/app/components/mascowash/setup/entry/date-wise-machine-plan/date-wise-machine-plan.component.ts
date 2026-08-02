import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';

interface MachinePlanRow {
  id: string; 
  masterId: string; 
  isDuplicate: boolean;

  // Read Only
  buyer: string;
  job: string;
  style: string;
  order: string;
  type: string;
  fabrication: string;
  color: string;
  dressPart: string;
  requiredDeliveryDate: string;
  uom: string;
  qty: number;

  // Data Entry
  planQty: number;
  planStartDate: Date | null;
  planEndDate: Date | null;
  processIds: any[];
  machineIds: any[];
  remarks: string;
}

@Component({
  selector: 'app-date-wise-machine-plan',
  templateUrl: './date-wise-machine-plan.component.html',
  styleUrls: ['./date-wise-machine-plan.component.scss']
})
export class DateWiseMachinePlanComponent implements OnInit {

  // Filters
  filterModel: any = {
    unitId: null,
    buyerId: null,
    styleId: null,
    orderId: null,
    jobId: null,
    fromDate: null,
    toDate: null
  };

  // Dropdown Lists
  unitList: any[] = [];
  buyerList: any[] = [];
  styleList: any[] = [];
  orderList: any[] = [];
  jobList: any[] = [];

  // Multi-select Lists
  processList: any[] = [];
  machineList: any[] = [];

  // Grid Data
  gridData: MachinePlanRow[] = [];

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadInitialDropdowns();
  }

  loadInitialDropdowns() {
    // Load Units
    this.service.GetUnitName().subscribe(res => {
      this.unitList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));

      // Auto Select Unit (typically ID 60 as seen in other components)
      const found = this.unitList.find(x => x.value === 60);
      if (found) {
        this.filterModel.unitId = found.value;
        this.onUnitChange();
      }
    });

    // Load Processes
    this.service.GetProcessNameDDL().subscribe((res) => {
      this.processList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));
    });

    // Load Machines
    this.service.GetMachineNoDDL().subscribe((res) => {
      this.machineList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id
      }));
    });
  }

  onUnitChange() {
    this.buyerList = [];
    this.styleList = [];
    this.orderList = [];
    this.jobList = [];
    this.filterModel.buyerId = null;
    this.filterModel.styleId = null;
    this.filterModel.orderId = null;
    this.filterModel.jobId = null;

    if (!this.filterModel.unitId) return;

    this.service.GetBuyerNameDDL().subscribe(res => {
      this.buyerList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName ?? x.BuyerName,
        value: x.ID ?? x.id ?? x.BuyerNo
      }));

      // Auto Select Buyer if only one
      if (this.buyerList.length === 1) {
        this.filterModel.buyerId = Number(this.buyerList[0].value);
        this.onBuyerChange();
      }
    });
  }

  onBuyerChange() {
    this.styleList = [];
    this.orderList = [];
    this.jobList = [];
    this.filterModel.styleId = null;
    this.filterModel.orderId = null;
    this.filterModel.jobId = null;

    if (!this.filterModel.unitId || !this.filterModel.buyerId) return;

    this.service.GetJobNoWithParameterDDL({
      unitId: this.filterModel.unitId,
      buyerId: this.filterModel.buyerId
    }).subscribe(res => {
      this.jobList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName ?? x.jobInfo,
        value: x.ID ?? x.id ?? x.JobId
      }));

      // Auto Select Job if only one
      if (this.jobList.length === 1) {
        this.filterModel.jobId = Number(this.jobList[0].value);
        this.onJobChange();
      }
    });
  }

  onJobChange() {
    this.styleList = [];
    this.orderList = [];
    this.filterModel.styleId = null;
    this.filterModel.orderId = null;

    if (!this.filterModel.unitId || !this.filterModel.buyerId || !this.filterModel.jobId) return;

    this.service.GetStyleNoWithParameterDDL({
      unitId: this.filterModel.unitId,
      buyerId: this.filterModel.buyerId,
      jobId: this.filterModel.jobId
    }).subscribe(res => {
      this.styleList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id ?? x.StyleId
      }));

      // Auto Select Style if only one
      if (this.styleList.length === 1) {
        this.filterModel.styleId = Number(this.styleList[0].value);
        this.onStyleChange();
      }
    });
  }

  onStyleChange() {
    this.orderList = [];
    this.filterModel.orderId = null;

    if (!this.filterModel.unitId || !this.filterModel.buyerId || !this.filterModel.jobId || !this.filterModel.styleId) return;

    this.service.GetOrderNoWithParameterDDL({
      unitId: this.filterModel.unitId,
      buyerId: this.filterModel.buyerId,
      jobId: this.filterModel.jobId,
      styleId: this.filterModel.styleId
    }).subscribe(res => {
      this.orderList = res.map((x: any) => ({
        label: x.DisplayName ?? x.displayName,
        value: x.ID ?? x.id ?? x.OrderId
      }));

      // Auto Select Order if only one
      if (this.orderList.length === 1) {
        this.filterModel.orderId = Number(this.orderList[0].value);
      }
    });
  }

  onSearch() {
    if (!this.filterModel.unitId || !this.filterModel.buyerId || !this.filterModel.styleId || !this.filterModel.fromDate || !this.filterModel.toDate) {
      this.toastr.warning('Please fill all mandatory filter fields (*)');
      return;
    }

    // Still using mock grid data since there is no Grid API specified yet.
    // Replace with this.service.getWashBatchPrepareGrid(this.filterModel) when backend is ready.
    this.gridData = [
      {
        id: 'row-1',
        masterId: 'master-1',
        isDuplicate: false,
        buyer: 'C&A', job: 'TFL-BO404-03-25', style: '2355887', order: 'PO-8403-27-302', type: 'Garments',
        fabrication: '57% BCI COTTON', color: 'Blue bell', dressPart: 'Bottom 1',
        requiredDeliveryDate: '5-Jul-25', uom: 'Piece', qty: 5664,
        planQty: 4800, planStartDate: new Date('2025-07-02'), planEndDate: new Date('2025-07-04'),
        processIds: [], machineIds: [], remarks: ''
      }
    ];

    this.cdr.detectChanges();
  }

  getRemainingQty(row: MachinePlanRow): number {
    const sumPlanQty = this.gridData
      .filter(x => x.masterId === row.masterId)
      .reduce((sum, current) => sum + (current.planQty || 0), 0);
    return row.qty - sumPlanQty;
  }

  duplicateRow(index: number, row: MachinePlanRow) {
    const newRow: MachinePlanRow = {
      ...row,
      id: 'row-' + Math.random().toString(36).substr(2, 9),
      isDuplicate: true,
      planQty: 0,
      planStartDate: null,
      planEndDate: null,
      processIds: [],
      machineIds: [],
      remarks: ''
    };
    
    let insertIdx = index + 1;
    while(insertIdx < this.gridData.length && this.gridData[insertIdx].masterId === row.masterId && this.gridData[insertIdx].isDuplicate) {
      insertIdx++;
    }
    
    this.gridData.splice(insertIdx, 0, newRow);
    this.cdr.detectChanges();
  }

  removeRow(index: number) {
    this.gridData.splice(index, 1);
    this.cdr.detectChanges();
  }

  goToInfographicView() {
    this.toastr.info('Navigating to Infographic/Gantt Chart view...');
  }

  onRefresh() {
    this.filterModel = {
      unitId: null, buyerId: null, styleId: null, orderId: null, jobId: null, fromDate: null, toDate: null
    };
    this.buyerList = [];
    this.jobList = [];
    this.styleList = [];
    this.orderList = [];
    this.gridData = [];
    this.loadInitialDropdowns(); // Re-auto select unit
    this.cdr.detectChanges();
  }

  onSave() {
    console.log('Saving Data:', this.gridData);
    this.toastr.success('Saved successfully');
  }

}
