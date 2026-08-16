import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  // {
  //   path:'',
  //   children: [
  //     {path: '', component: DashboardComponent}
  //   ]
  // }
  {
  path: "",
  children: [
    {
      path: "default",
      component: DashboardComponent,
      data: {
        breadcrumb: "Dashboard",
      },
    },
    {
      path: "floor-status",
      loadComponent: () => import('../mascowash/setup/entry/floor-status-dashboard/floor-status-dashboard.component').then(m => m.FloorStatusDashboardComponent),
      data: {
        breadcrumb: "Floor Status",
      },
    }
  ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
