import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { SiginComponent } from './sigin/sigin.component';
import { SignupComponent } from './signup/signup.component';
import { UnderContructionComponent } from './under-contruction/under-contruction.component';

const routes: Routes = [
  {path:'', children:[
    {path:'forget-password', component:  ForgetPasswordComponent},
    {path:'lockscreen', component:  LockscreenComponent},
    {path:'signin', component:  SiginComponent},
    {path:'signup', component:  SignupComponent},
    {path:'under-construction', component:  UnderContructionComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
