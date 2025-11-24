import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdvancedUiRoutingModule } from './advanced-ui-routing.module';
import { AccordionsComponent } from './accordions/accordions.component';
import { CarouselComponent } from './carousel/carousel.component';
import { CardsComponent } from './cards/cards.component';
import { CountersComponent } from './counters/counters.component';
import { ModalsComponent } from './modals/modals.component';
import { SweetAlertsComponent } from './sweet-alerts/sweet-alerts.component';
import { TimelineComponent } from './timeline/timeline.component';
import { RatingComponent } from './rating/rating.component';
import { MedialObjectComponent } from './medial-object/medial-object.component';
import { TabsComponent } from './tabs/tabs.component';
import { TooltipPopoverComponent } from './tooltip-popover/tooltip-popover.component';
import { ProgressbarsComponent } from './progressbars/progressbars.component';
import { FootersComponent } from './footers/footers.component';
import { UserlistComponent } from './userlist/userlist.component';
import { FileAttachmentsComponent } from './file-attachments/file-attachments.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModuleModule } from 'src/app/materialModule/material-module/material-module.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdTimerModule } from 'angular-cd-timer';
import { BasicDialogContent, NGMDefaultDialogComponent } from './modals/ngmdefault-dialog/ngmdefault-dialog.component';
import { DialogMenuDialog, NGMDropdownDialogComponent } from './modals/ngmdropdown-dialog/ngmdropdown-dialog.component';
import { DialogOverview, NGMOverlayDialogComponent } from './modals/ngmoverlay-dialog/ngmoverlay-dialog.component';
import { BarRatingModule } from "ngx-bar-rating";
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar, faStarHalfAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStars } from '@fortawesome/free-regular-svg-icons';
import { faGithub, faGithubAlt, faTwitter } from '@fortawesome/free-brands-svg-icons';
@NgModule({
  declarations: [
    AccordionsComponent,
    CarouselComponent,
    CardsComponent,
    CountersComponent,
    ModalsComponent,
    SweetAlertsComponent,
    TimelineComponent,
    RatingComponent,
    MedialObjectComponent,
    TabsComponent,
    TooltipPopoverComponent,
    ProgressbarsComponent,
    FootersComponent,
    UserlistComponent,
    FileAttachmentsComponent,
    NGMDefaultDialogComponent,
    NGMDropdownDialogComponent,
    NGMOverlayDialogComponent,
    BasicDialogContent,
    DialogMenuDialog,
    DialogOverview
  ],
  imports: [
    CommonModule,
    AdvancedUiRoutingModule,
    SharedModule,
    NgbModule,
    MaterialModuleModule,
    FormsModule, ReactiveFormsModule,
    CdTimerModule,
    BarRatingModule,
    FontAwesomeModule,
  ]
})
export class AdvancedUiModule { 
  constructor(library: FaIconLibrary) {
    library.addIcons(
      faTwitter,
      faGithub,
      faGithubAlt,
      faStar,
      faStarHalfAlt,
      farStars,
      faTimesCircle
    );
  }
}
