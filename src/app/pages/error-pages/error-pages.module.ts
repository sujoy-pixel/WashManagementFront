import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorPagesRoutingModule } from './error-pages-routing.module';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { Error501Component } from './error501/error501.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    Error404Component,
    Error500Component,
    Error501Component
  ],
  imports: [
    CommonModule,
    ErrorPagesRoutingModule,
    SharedModule
  ]
})
export class ErrorPagesModule { }
