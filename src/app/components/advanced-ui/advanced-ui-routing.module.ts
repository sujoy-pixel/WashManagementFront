import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccordionsComponent } from './accordions/accordions.component';
import { CardsComponent } from './cards/cards.component';
import { CarouselComponent } from './carousel/carousel.component';
import { CountersComponent } from './counters/counters.component';
import { FileAttachmentsComponent } from './file-attachments/file-attachments.component';
import { FootersComponent } from './footers/footers.component';
import { MedialObjectComponent } from './medial-object/medial-object.component';
import { ModalsComponent } from './modals/modals.component';
import { ProgressbarsComponent } from './progressbars/progressbars.component';
import { RatingComponent } from './rating/rating.component';
import { SweetAlertsComponent } from './sweet-alerts/sweet-alerts.component';
import { TabsComponent } from './tabs/tabs.component';
import { TimelineComponent } from './timeline/timeline.component';
import { TooltipPopoverComponent } from './tooltip-popover/tooltip-popover.component';
import { UserlistComponent } from './userlist/userlist.component';

const routes: Routes = [
  {
    path:'', children: [
      {path: 'accordion', component: AccordionsComponent},
      {path: 'carousel', component: CarouselComponent},
      {path: 'cards', component: CardsComponent},
      {path: 'counters', component: CountersComponent},
      {path: 'modals', component: ModalsComponent},
      {path: 'timeline', component: TimelineComponent},
      {path: 'sweet-alert', component: SweetAlertsComponent},
      {path: 'ratings', component: RatingComponent},
      {path: 'media-object', component: MedialObjectComponent},
      {path: 'tabs', component: TabsComponent},
      {path: 'tooltip-popover', component: TooltipPopoverComponent},
      {path: 'progressbar', component: ProgressbarsComponent},
      {path: 'footers', component: FootersComponent},
      {path: 'userlist', component: UserlistComponent},
      {path: 'file-attachments', component: FileAttachmentsComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvancedUiRoutingModule { }
