import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { TableRoutingModule } from './table-routing.module';
import { DefaultTableComponent } from './default-table/default-table.component';
import { DataTableComponent } from './data-table/data-table.component';
import { EditableTableComponent } from './editable-table/editable-table.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BasicDataTableComponent } from './data-table/basic-data-table/basic-data-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModuleModule } from 'src/app/materialModule/material-module/material-module.module';
import { ExpandableRowsComponent } from './data-table/expandable-rows/expandable-rows.component';
import { FilterSortPaginationComponent } from './data-table/filter-sort-pagination/filter-sort-pagination.component';
import { RetiveingHttpComponent } from './data-table/retiveing-http/retiveing-http.component';
import { TableSelectComponent } from './data-table/table-select/table-select.component';
import { AdddialogBoxComponent } from './editable-table/adddialog-box.component';
import { AddMemberComponent } from './firebase_crud_table/add-member/add-member.component';
import { CRUDComponent } from './firebase_crud_table/crud/crud.component';
import { EditMemberComponent } from './firebase_crud_table/edit-member/edit-member.component';
import { MemberListComponent } from './firebase_crud_table/member-list/member-list.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    DefaultTableComponent,
    DataTableComponent,
    EditableTableComponent,
    BasicDataTableComponent,
    ExpandableRowsComponent,
    FilterSortPaginationComponent,
    RetiveingHttpComponent,
    TableSelectComponent,
    AdddialogBoxComponent,
    AddMemberComponent,
    CRUDComponent,
    EditMemberComponent,
    MemberListComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    TableRoutingModule,
    SharedModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    MaterialModuleModule,
    NgxPaginationModule,
    ToastrModule.forRoot(), // ToastrModule added
  ],
  providers:[
    ToastrService
  ]
})
export class TableModule { }
