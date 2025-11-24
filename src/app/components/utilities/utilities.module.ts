import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UtilitiesRoutingModule } from './utilities-routing.module';
import { BackgroundComponent } from './background/background.component';
import { BorderComponent } from './border/border.component';
import { DisplayComponent } from './display/display.component';
import { FlexComponent } from './flex/flex.component';
import { HeightComponent } from './height/height.component';
import { MarginComponent } from './margin/margin.component';
import { PaddingComponent } from './padding/padding.component';
import { PositionComponent } from './position/position.component';
import { WidthComponent } from './width/width.component';
import { OpacityComponent } from './opacity/opacity.component';
import { EmptyPageComponent } from './empty-page/empty-page.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    BackgroundComponent,
    BorderComponent,
    DisplayComponent,
    FlexComponent,
    HeightComponent,
    MarginComponent,
    PaddingComponent,
    PositionComponent,
    WidthComponent,
    OpacityComponent,
    EmptyPageComponent
  ],
  imports: [
    CommonModule,
    UtilitiesRoutingModule,
    SharedModule
  ]
})
export class UtilitiesModule { }
