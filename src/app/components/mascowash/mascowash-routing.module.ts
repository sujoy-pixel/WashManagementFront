import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MascowashComponent } from './mascowash.component';

import { ActualDateEntryComponent } from './setup/entry/actual-date-entry/actual-date-entry.component';


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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  //providers:[ScrollService],
  exports: [RouterModule],
})
export class MascowashRoutingModule {}
