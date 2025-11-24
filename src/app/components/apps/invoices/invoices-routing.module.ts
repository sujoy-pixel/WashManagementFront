import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { EditInvoiceComponent } from './edit-invoice/edit-invoice.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { TimelogInvoiceComponent } from './timelog-invoice/timelog-invoice.component';

const routes: Routes = [
  {path: 'invoice', children:[
    {path:'invoice-list', component: InvoiceListComponent},
    {path:'invoice-details', component: InvoiceDetailsComponent},
    {path:'create-invoice', component: CreateInvoiceComponent},
    {path:'time-log-invoice', component: TimelogInvoiceComponent},
    {path:'edit-invoice', component: EditInvoiceComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoicesRoutingModule { }
