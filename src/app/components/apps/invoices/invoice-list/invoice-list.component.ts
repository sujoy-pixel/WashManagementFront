import { Component, OnInit } from '@angular/core';

interface InvoiceListType{
  id:number;
  invoiceNum?: string;
  status?: string;
  statusStage:string;
  amount?: number;
  img?: string;
  name?: string;
  mail?: string;
  dueDate?: string;
}

const InvoiceListData:InvoiceListType[]=[
  {id:1, invoiceNum: 'INV-1111', status:'Paid', statusStage: 'success', amount:2805, img:'./assets//images/users/1.jpg', name:'Lisbon Taylor', mail:'invoice@spruko.com', dueDate:'11-11-22'},
  {id:2, invoiceNum: 'INV-1112', status:'Unpaid', statusStage: 'danger', amount:12355, img:'./assets//images/users/12.jpg', name:'Daniel Obrien', mail:'invoice@spruko.com', dueDate:'12-11-22'},
  {id:3, invoiceNum: 'INV-1113', status:'Paid', statusStage: 'success', amount:25005, img:'./assets//images/users/13.jpg', name:'William Turner', mail:'invoice@spruko.com', dueDate:'11-11-22'},
  {id:4, invoiceNum: 'INV-1114', status:'Overdue', statusStage: 'warning', amount:5200, img:'./assets//images/users/2.jpg', name:'Onena Tyrell', mail:'invoice@spruko.com', dueDate:'13-11-22'},
  {id:5, invoiceNum: 'INV-1115', status:'Paid', statusStage: 'success', amount:1805, img:'./assets//images/users/15.jpg', name:'Brandom Marsh', mail:'invoice@spruko.com', dueDate:'11-11-22'},
  {id:6, invoiceNum: 'INV-1116', status:'Paid', statusStage: 'success', amount:2805, img:'./assets//images/users/4.jpg', name:'Emilie Benett', mail:'invoice@spruko.com', dueDate:'15-11-22'},
  {id:7, invoiceNum: 'INV-1117', status:'Unpaid', statusStage: 'danger', amount:2530, img:'./assets//images/users/14.jpg', name:'Jamie Podrick', mail:'invoice@spruko.com', dueDate:'12-11-22'},
  {id:8, invoiceNum: 'INV-1118', status:'Overdue', statusStage: 'warning', amount:6500, img:'./assets//images/users/16.jpg', name:'Sam Smith', mail:'invoice@spruko.com', dueDate:'14-11-22'},
  {id:9, invoiceNum: 'INV-1119', status:'Overdue', statusStage: 'warning', amount:2805, img:'./assets//images/users/3.jpg', name:'Taylor Lisbon', mail:'invoice@spruko.com', dueDate:'16-11-22'}
]

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
  InvoiceListItems!: InvoiceListType[]
  constructor() { }

  ngOnInit(): void {
    this.InvoiceListItems = InvoiceListData
  }

}
