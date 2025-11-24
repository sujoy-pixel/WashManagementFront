import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { SiginComponent } from './sigin/sigin.component';
import { SignupComponent } from './signup/signup.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { UnderContructionComponent } from './under-contruction/under-contruction.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    SiginComponent,
    SignupComponent,
    ForgetPasswordComponent,
    LockscreenComponent,
    UnderContructionComponent
  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    SharedModule
  ]
})
export class AuthenticationModule { }
