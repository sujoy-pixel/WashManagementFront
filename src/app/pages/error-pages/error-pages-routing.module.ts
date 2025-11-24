import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { Error501Component } from './error501/error501.component';

const routes: Routes = [
  {
    path: '', children: [
      {path: 'error-404', component: Error404Component},
      {path: 'error-500', component: Error500Component},
      {path: 'error-501', component: Error501Component},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErrorPagesRoutingModule { }
