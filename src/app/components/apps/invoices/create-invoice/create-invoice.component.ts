import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss']
})
export class CreateInvoiceComponent implements OnInit {

  @ViewChild('AddShipingAddress') AddShipingAddress!: ElementRef;
  @ViewChild('AddressField') AddressField!: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  shippingAddress(){
    this.AddShipingAddress.nativeElement.classList.add('d-none')
    this.AddressField.nativeElement.classList.remove('d-none')   
  }
  
}
