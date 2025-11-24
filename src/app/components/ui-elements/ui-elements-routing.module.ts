import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { PaginationComponent } from './pagination/pagination.component';
import { PanelsComponent } from './panels/panels.component';
import { RangeSliderComponent } from './range-slider/range-slider.component';
import { ScrollComponent } from './scroll/scroll.component';
import { TagsComponent } from './tags/tags.component';
import { ThumbnailsComponent } from './thumbnails/thumbnails.component';
import { TreeviewComponent } from './treeview/treeview.component';
import { TypographyComponent } from './typography/typography.component';

const routes: Routes = [
  {
    path:'', children:[
      { path:'alerts', component: AlertsComponent},
      { path:'avatar', component: AvatarsComponent},
      { path:'badges', component: BadgesComponent},
      { path:'breadcrumbs', component: BreadcrumbsComponent},
      { path:'buttons', component: ButtonsComponent},
      { path:'colors', component: ColorsComponent},
      { path:'dropdown', component: DropdownComponent},
      { path:'gallery', component: GalleryComponent},
      { path:'loaders', component: LoadersComponent},
      { path:'navigation', component: NavigationComponent},
      { path:'pagination', component: PaginationComponent},
      { path:'panels', component: PanelsComponent},
      { path:'range-slider', component: RangeSliderComponent},
      { path:'scroll', component: ScrollComponent},
      { path:'tags', component: TagsComponent},
      { path:'thumbnails', component: ThumbnailsComponent},
      { path:'treeview', component: TreeviewComponent},
      { path:'typography', component: TypographyComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UiElementsRoutingModule { }
