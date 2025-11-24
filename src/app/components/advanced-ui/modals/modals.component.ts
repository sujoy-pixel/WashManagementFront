import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss']
})
export class ModalsComponent implements OnInit {

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }
  BasicOpen(basicmodal:any) {
    this.modalService.open(basicmodal);
  }
  SuccessOpen(successmodal:any) {
    this.modalService.open(successmodal, { centered: true });
  }
  WarningOpen(warningmodal:any) {
    this.modalService.open(warningmodal, { centered: true });
  }
  MultiModal() {
    this.modalService.open(NgbdModal1Content);
  }
  InputModal(inputModal:any) {
    this.modalService.open(inputModal);
  }

  SmallOpen(smallmodal:any) {
    this.modalService.open(smallmodal, { size: 'sm' });
  }
  LargeOpen(largemodal:any) {
    this.modalService.open(largemodal, { size: 'lg' });
  }
  ExtraLargeOpen(extraLargeModal:any) {
    this.modalService.open(extraLargeModal, { size: 'xl' });
  }
  ScrollableContentOpen(largeContent:any) {
    this.modalService.open(largeContent, { scrollable: true });
  }
}



// For multiModal

@Component({
  template: `
    <div class="modal-header">
      <h6 class="modal-title">First Modal</h6>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <p>Eos accusam ipsum clita sadipscing diam gubergren ipsum voluptua et sanctus. Justo ea gubergren lorem.</p>
    </div>
    <div class="modal-footer">
      <p><button class="btn btn-primary" (click)="open()">Second modal</button></p>
      <button type="button" class="btn btn-light" (click)="activeModal.close('Close click')">Close</button>
    </div>
  `
})
export class NgbdModal1Content {
  constructor(private modalService: NgbModal, public activeModal: NgbActiveModal) {}

  open() { this.modalService.open(NgbdModal2Content, {size: 'lg'}); }
}

@Component({
  template: `
    <div class="modal-header">
      <h6 class="modal-title">Second Modal</h6>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <p>Eos accusam ipsum clita sadipscing diam gubergren ipsum voluptua et sanctus. Justo ea gubergren lorem.</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-light" (click)="activeModal.close('Close click')">Close</button>
    </div>
  `
})
export class NgbdModal2Content {
  constructor(public activeModal: NgbActiveModal) {}
}