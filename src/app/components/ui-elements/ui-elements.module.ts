import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiElementsRoutingModule } from './ui-elements-routing.module';
import { AlertsComponent } from './alerts/alerts.component';
import { AvatarsComponent } from './avatars/avatars.component';
import { BadgesComponent } from './badges/badges.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { ColorsComponent } from './colors/colors.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { GalleryComponent } from './gallery/gallery.component';
import { LoadersComponent } from './loaders/loaders.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NotificationComponent } from './notification/notification.component';
import { PaginationComponent } from './pagination/pagination.component';
import { PanelsComponent } from './panels/panels.component';
import { RangeSliderComponent } from './range-slider/range-slider.component';
import { ScrollComponent } from './scroll/scroll.component';
import { TagsComponent } from './tags/tags.component';
import { ThumbnailsComponent } from './thumbnails/thumbnails.component';
import { TreeviewComponent } from './treeview/treeview.component';
import { TypographyComponent } from './typography/typography.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModuleModule } from 'src/app/materialModule/material-module/material-module.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';

@NgModule({
  declarations: [
    AlertsComponent,
    AvatarsComponent,
    BadgesComponent,
    BreadcrumbsComponent,
    ButtonsComponent,
    ColorsComponent,
    DropdownComponent,
    GalleryComponent,
    LoadersComponent,
    NavigationComponent,
    NotificationComponent,
    PaginationComponent,
    PanelsComponent,
    RangeSliderComponent,
    ScrollComponent,
    TagsComponent,
    ThumbnailsComponent,
    TreeviewComponent,
    TypographyComponent
  ],
  imports: [
    CommonModule,
    UiElementsRoutingModule,
    SharedModule,
    NgbModule,
    MaterialModuleModule,
    FormsModule, ReactiveFormsModule,
    GalleryModule.withConfig({
      // thumbView: 'contain',
    }),
    LightboxModule,
    NgxSliderModule
  ]
})
export class UiElementsModule { }
