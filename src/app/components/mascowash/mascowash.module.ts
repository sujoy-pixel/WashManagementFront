import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { MascowashRoutingModule } from './mascowash-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { MatTabsModule } from '@angular/material/tabs';

import { MascowashComponent } from './mascowash.component';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActualDateEntryComponent } from './setup/entry/actual-date-entry/actual-date-entry.component';
//import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ProcessNameEntryComponent } from './setup/entry/process-name-entry/process-name-entry.component';

import { InspectionTypeEntryComponent } from './setup/entry/inspection-type-entry/inspection-type-entry.component';

import { OperationNameEntryComponent } from './setup/entry/operation-name-entry/operation-name-entry.component';

@NgModule({
  declarations: [
    MascowashComponent,
    ActualDateEntryComponent,
    ProcessNameEntryComponent,

    InspectionTypeEntryComponent,

    OperationNameEntryComponent

  
  ],
  imports: [
    MatTabsModule,
    CommonModule,
    MascowashRoutingModule,
    ReactiveFormsModule,
    PanelModule,
    TableModule,
    NgSelectModule,
    FormsModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
    AutoCompleteModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    NgxChartsModule,
  ],
})
export class MascowashModule {}
