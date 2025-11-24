import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeatherIconsComponent } from './feather-icons/feather-icons.component';
import { FlagIconsComponent } from './flag-icons/flag-icons.component';
import { FontAwsomeComponent } from './font-awsome/font-awsome.component';
import { IonicIconsComponent } from './ionic-icons/ionic-icons.component';
import { MaterialDesignIconComponent } from './material-design-icon/material-design-icon.component';
import { Pe7iconsComponent } from './pe7icons/pe7icons.component';
import { SimpleLineIconComponent } from './simple-line-icon/simple-line-icon.component';
import { ThemifyIconsComponent } from './themify-icons/themify-icons.component';
import { TypiconsComponent } from './typicons/typicons.component';
import { WeatherIconsComponent } from './weather-icons/weather-icons.component';

const routes: Routes = [
  {
    path:'', children:[
      { path: 'font-awsome', component: FontAwsomeComponent},
      { path: 'material-design-icons', component: MaterialDesignIconComponent},
      { path: 'simple-line-icons', component: SimpleLineIconComponent},
      { path: 'feather-icons', component: FeatherIconsComponent},
      { path: 'ionic-icons', component: IonicIconsComponent},
      { path: 'flag-icons', component: FlagIconsComponent},
      { path: 'pe7-icons', component: Pe7iconsComponent},
      { path: 'themify-icons', component: ThemifyIconsComponent},
      { path: 'typicons', component: TypiconsComponent},
      { path: 'weather-icons', component: WeatherIconsComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IconsRoutingModule { }
