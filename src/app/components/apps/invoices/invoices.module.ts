import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoicesRoutingModule } from './invoices-routing.module';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { TimelogInvoiceComponent } from './timelog-invoice/timelog-invoice.component';
import { EditInvoiceComponent } from './edit-invoice/edit-invoice.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    InvoiceListComponent,
    InvoiceDetailsComponent,
    CreateInvoiceComponent,
    TimelogInvoiceComponent,
    EditInvoiceComponent
  ],
  imports: [
    CommonModule,
    InvoicesRoutingModule,
    SharedModule,
    NgbModule,
    NgSelectModule,
    FormsModule, ReactiveFormsModule
  ]
})
export class InvoicesModule { }
