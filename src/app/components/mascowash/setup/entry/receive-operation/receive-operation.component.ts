import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { WashSetupService } from '../../../services/washsetup.service';

@Component({
  selector: 'app-receive-operation',
  templateUrl: './receive-operation.component.html',
  styleUrls: ['./receive-operation.component.scss']
})
export class ReceiveOperationComponent implements OnInit {


  isReviewMode = false;

  Model = {
    UnitId: null,
    trackingNo: '',
    dyeingBatchNo: '',
    manualNo: '',
    isTrackingActive: true,
    isDyeingActive: false,
    isManualActive: false
  };

  review = {
    UnitId: null,
    fromDate: null,
    toDate: null
  };

  detailList: any[] = [];

  UnitList: any[] = [];
  fromUnitList: any[] = [];
  buyerList: any[] = [];
  jobList: any[] = [];
  styleList: any[] = [];
  orderList: any[] = [];
  fabricationList: any[] = [];
  gsmList: any[] = [];
  colorList: any[] = [];
  dressPartList: any[] = [];
  uomList: any[] = [];

  sizePopupVisible = false;
  selectedRow: any;
  sizeList: any[] = [];
  totalSizeQty = 0;

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}
isNewMode = false;


onNew() {
  this.isNewMode = true;
  this.isReviewMode = false;
}

onReview() {
  this.isReviewMode = true;
  this.isNewMode = false;
}


  ngOnInit(): void {
    this.loadDropdowns();

  }
 loadDropdowns() {
    this.UnitList = [];
    this.service.GetUnitName().subscribe((res) => {
      this.UnitList.push({ label: '-- Select --', value: null });
      res.forEach((x) => {
        this.UnitList.push({
          label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id,
        });
        this.fromUnitList = [...this.UnitList];
      });
    });
  


  this.service.GetBuyerNameDDL().subscribe(res => {
    this.buyerList = res.map(x => ({
      label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id,
      // label: x.BuyerName,
      // value: Number(x.BuyerNo)
    }));
  });
this.service.GetJobNoDDL().subscribe(res => {
  this.jobList = res.map(x => ({
    label: x.JobInfo,
    value: x.JobId.toString()
  }));
});
  // this.service.GetJobNoDDL().subscribe(res => {
  //   this.jobList = res.map(x => ({
  //     label: x.DisplayName ?? x.displayName,
  //         value: x.ID ?? x.id,
  //     // label: x.JobInfo,
  //     // value: Number(x.JobId)
  //   }));
  //   console.log("Job List", this.jobList);
  // });

  this.service.GetStyleNoDDL().subscribe(res => {
    this.styleList = res.map(x => ({
      label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id,
      // label: x.StyleName,
      // value: Number(x.StyleNo)
    }));
  });

  this.service.GetOrderNoDDL().subscribe(res => {
    this.orderList = res.map(x => ({
      label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id,
      // label: x.OrderNo,
      // value: Number(x.OrderId)
    }));
  });

  this.service.GetFabricationDDL().subscribe(res => {
    this.fabricationList = res.map(x => ({
       label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id,
      // label: x.FabricationName,
      // value: Number(x.Fabrication)
    }));
  });

  this.service.GetGSMDDL().subscribe(res => {
    this.gsmList = res.map(x => ({
     label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id,
      // label: x.GSM,
      // value: Number(x.ISZID)
    }));
  });

  this.service.GetDressPartDDL().subscribe(res => {
    this.dressPartList = res.map(x => ({
     label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id,
      // label: x.DressPart,
      // value: Number(x.DressPartId)
    }));
  });

  this.service.GetUOMDDL().subscribe(res => {
    this.uomList = res.map(x => ({
     label: x.DisplayName ?? x.displayName,
          value: x.ID ?? x.id,
      // label: x.UOM,
      // value: Number(x.UOMDetailsId)
    }));
  });
}

onTrackingEnter() {
  this.service.getReceiveByTrackingNo(this.Model.trackingNo)
    .subscribe(res => this.bindDetailRows(res));
}

bindDetailRows(rows: any[]) {
  this.detailList = rows.map(r => ({
    trackingNo: r.trackingNo,
    fromUnitId: Number(r.fromUnitId),
    receiveDate: new Date(r.receiveDate),
    buyerNo: Number(r.buyerNo),
     jobId: r.JobId?.toString(),
    styleNo: Number(r.styleNo),
    orderId: Number(r.orderId),
    type: r.type,
    fabricationId: Number(r.fabrication),
    composition: r.composition,
    gsmId: Number(r.iszid),
    colorId: Number(r.icleid),
    dressPartId: Number(r.dressPartId),
    uomId: Number(r.uomDetailsId),
    totalQty: r.qty,
    probableDeliveryDate: new Date(r.probableDeliveryDate),
    shipmentDate: new Date(r.shipmentDate),
    operationTypes: '',
    sizeDetails: []
  }));
}


  // loadDropdowns() {
  //   this.UnitList = [];
  //   this.service.GetUnitName().subscribe((res) => {
  //     this.UnitList.push({ label: '-- Select --', value: null });
  //     res.forEach((x) => {
  //       this.UnitList.push({
  //         label: x.DisplayName ?? x.displayName,
  //         value: x.ID ?? x.id,
  //       });
  //       this.fromUnitList = [...this.UnitList];
  //     });
  //   });
  

  //   this.service.GetBuyerNameDDL().subscribe(res =>
  //     this.buyerList = res.map(x => ({
  //       label: x.BuyerName,
  //       value: x.BuyerNo
  //     }))
  //   );




  //   this.service.GetJobNoDDL().subscribe(res =>
  //     this.jobList = res.map(x => ({
  //       label: x.JobInfo,
  //       value: x.JobId
  //     }))
  //   );

  //   this.service.GetStyleNoDDL().subscribe(res =>
  //     this.styleList = res.map(x => ({
  //       label: x.StyleName,
  //       value: x.StyleNo
  //     }))
  //   );

  //   this.service.GetOrderNoDDL().subscribe(res =>
  //     this.orderList = res.map(x => ({
  //       label: x.OrderNo,
  //       value: x.OrderId
  //     }))
  //   );

  //   this.service.GetFabricationDDL().subscribe(res =>
  //     this.fabricationList = res.map(x => ({
  //       label: x.FabricationName,
  //       value: x.Fabrication
  //     }))
  //   );

  //   this.service.GetGSMDDL().subscribe(res =>
  //     this.gsmList = res.map(x => ({
  //       label: x.GSM,
  //       value: x.ISZID
  //     }))
  //   );

  //   this.service.GetDressPartDDL().subscribe(res =>
  //     this.dressPartList = res.map(x => ({
  //       label: x.DressPart,
  //       value: x.DressPartId
  //     }))
  //   );

  //   this.service.GetUOMDDL().subscribe(res =>
  //     this.uomList = res.map(x => ({
  //       label: x.UOM,
  //       value: x.UOMDetailsId
  //     }))
  //   );
  // }

  // onTrackingEnter() {
  //   this.service.getReceiveByTrackingNo(this.Model.trackingNo)
  //     .subscribe(res => this.bindDetailRows(res));
  // }

  // bindDetailRows(rows: any[]) {
  //   this.detailList = rows.map(r => ({
  //     trackingNo: r.trackingNo,
  //     fromUnitId: r.fromUnitId,
  //     receiveDate: new Date(r.receiveDate),
  //     buyerNo: r.buyerNo,
  //     jobId: r.jobId,
  //     styleNo: r.styleNo,
  //     orderId: r.orderId,
  //     type: r.type,
  //     fabricationId: r.fabrication,
  //     composition: r.composition,
  //     gsmId: r.iszid,
  //     colorId: r.icleid,
  //     dressPartId: r.dressPartId,
  //     uomId: r.uomDetailsId,
  //     totalQty: r.qty,
  //     probableDeliveryDate: new Date(r.probableDeliveryDate),
  //     shipmentDate: new Date(r.shipmentDate),
  //     sizeDetails: []
  //   }));
  //   this.cdr.detectChanges();
  // }

  openSizePopup(row: any) {
    this.selectedRow = row;
    this.sizeList = row.sizeDetails.length
      ? [...row.sizeDetails]
      : [{ size: 'Default', qty: row.totalQty }];
    this.calculateSizeTotal();
    this.sizePopupVisible = true;
  }

  calculateSizeTotal() {
    this.totalSizeQty = this.sizeList.reduce((a, b) => a + (+b.qty || 0), 0);
  }

  confirmSizeQty() {
    this.selectedRow.sizeDetails = [...this.sizeList];
    this.selectedRow.totalQty = this.totalSizeQty;
    this.sizePopupVisible = false;
  }
}


