import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MascowashComponent } from './mascowash.component';

import { ActualDateEntryComponent } from './setup/entry/actual-date-entry/actual-date-entry.component';
import { ProcessNameEntryComponent } from './setup/entry/process-name-entry/process-name-entry.component';
<<<<<<< HEAD
import { InspectionTypeEntryComponent } from './setup/entry/inspection-type-entry/inspection-type-entry.component';

=======
import { OperationNameEntryComponent } from './setup/entry/operation-name-entry/operation-name-entry.component';
>>>>>>> 2be01bce33aa311a3596b1b67a00292bcba03503

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
<<<<<<< HEAD
        path: 'setup/entry/type-of-inspection',
        component: InspectionTypeEntryComponent,
=======
        path: 'setup/entry/operation-name-entry',
        component: OperationNameEntryComponent,
>>>>>>> 2be01bce33aa311a3596b1b67a00292bcba03503
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
