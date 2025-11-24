import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutCompanyComponent } from './about-company/about-company.component';
import { FaqsComponent } from './faqs/faqs.component';
import { PricingComponent } from './pricing/pricing.component';
import { ProfileComponent } from './profile/profile.component';
import { ServiceComponent } from './service/service.component';
import { SettingsComponent } from './settings/settings.component';
import { SwitcherComponent } from './switcher/switcher.component';
import { TermsComponent } from './terms/terms.component';

const routes: Routes = [
  {path:'', children:[
    {path:'settings', component:  SettingsComponent},
    {path:'profile', component:  ProfileComponent},
    {path:'about-company', component:  AboutCompanyComponent},
    {path:'services', component: ServiceComponent},
    {path:'switcher', component:  SwitcherComponent},
    {path:'terms', component:  TermsComponent},
    {path:'faqs', component:  FaqsComponent},
    {path:'pricing', component:  PricingComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
