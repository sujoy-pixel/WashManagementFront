import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { MapsRoutingModule } from './maps-routing.module';
import { LeafletComponent } from './leaflet/leaflet.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

@NgModule({
  declarations: [
    LeafletComponent,
  ],
  imports: [
    CommonModule,
    MapsRoutingModule,
    SharedModule,
    LeafletModule,
    HttpClientModule,
  ]
})
export class MapsModule { }
