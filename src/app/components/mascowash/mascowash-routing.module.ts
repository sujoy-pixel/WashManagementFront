import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MascowashComponent } from './mascowash.component';

import { ActualDateEntryComponent } from './setup/entry/actual-date-entry/actual-date-entry.component';
import { ProcessNameEntryComponent } from './setup/entry/process-name-entry/process-name-entry.component';
import { InspectionTypeEntryComponent } from './setup/entry/inspection-type-entry/inspection-type-entry.component';


const routes: Routes = [
  {
    path: 'mascowash',
    component: MascowashComponent,
    children: [
      {
        path: 'setup/entry/entry-list',
        component: ActualDateEntryComponent,
        runGuardsAndResolvers: 'always',
      },
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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  //providers:[ScrollService],
  exports: [RouterModule],
})
export class MascowashRoutingModule {}
