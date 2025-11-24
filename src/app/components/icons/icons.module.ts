import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IconsRoutingModule } from './icons-routing.module';
import { FontAwsomeComponent } from './font-awsome/font-awsome.component';
import { MaterialDesignIconComponent } from './material-design-icon/material-design-icon.component';
import { SimpleLineIconComponent } from './simple-line-icon/simple-line-icon.component';
import { FeatherIconsComponent } from './feather-icons/feather-icons.component';
import { IonicIconsComponent } from './ionic-icons/ionic-icons.component';
import { FlagIconsComponent } from './flag-icons/flag-icons.component';
import { Pe7iconsComponent } from './pe7icons/pe7icons.component';
import { ThemifyIconsComponent } from './themify-icons/themify-icons.component';
import { TypiconsComponent } from './typicons/typicons.component';
import { WeatherIconsComponent } from './weather-icons/weather-icons.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    FontAwsomeComponent,
    MaterialDesignIconComponent,
    SimpleLineIconComponent,
    FeatherIconsComponent,
    IonicIconsComponent,
    FlagIconsComponent,
    Pe7iconsComponent,
    ThemifyIconsComponent,
    TypiconsComponent,
    WeatherIconsComponent
  ],
  imports: [
    CommonModule,
    IconsRoutingModule,
    SharedModule,
    NgbModule
  ]
})
export class IconsModule { }
