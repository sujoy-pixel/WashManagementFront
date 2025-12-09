import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MascowashComponent } from './mascowash.component';

// import { ActualDateEntryComponent } from './setup/entry/actual-date-entry/actual-date-entry.component';
import { ProcessNameEntryComponent } from './setup/entry/process-name-entry/process-name-entry.component';

import { InspectionTypeEntryComponent } from './setup/entry/inspection-type-entry/inspection-type-entry.component';

import { InspectionAreaEntryComponent } from './setup/entry/inspection-area-entry/inspection-area-entry.component';
import { OperationNameEntryComponent } from './setup/entry/operation-name-entry/operation-name-entry.component';
import { InspectionHeadLayoutEntryComponent } from './setup/entry/inspection-head-layout-entry/inspection-head-layout-entry.component';

const routes: Routes = [
  {
    path: 'mascowash',
    component: MascowashComponent,
    children: [
      // {
      //   path: 'setup/entry/entry-list',
      //   component: ActualDateEntryComponent,
      //   runGuardsAndResolvers: 'always',
      // },
      {
        path: 'setup/entry/process-name-entry',
        component: ProcessNameEntryComponent,
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'setup/entry/type-of-inspection',
        component: InspectionTypeEntryComponent,
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'setup/entry/operation-name-entry',
        component: OperationNameEntryComponent,
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'setup/entry/area-of-inspection',
        component: InspectionAreaEntryComponent,
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'setup/entry/inspection-head-layout',
        component: InspectionHeadLayoutEntryComponent,
        runGuardsAndResolvers: 'always',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  //providers:[ScrollService],
  exports: [RouterModule],
})
export class MascowashRoutingModule {}
