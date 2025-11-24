import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmailRoutingModule } from './email-routing.module';
import { InboxComponent } from './inbox/inbox.component';
import { ComposeMailComponent } from './compose-mail/compose-mail.component';
import { ReadMailComponent } from './read-mail/read-mail.component';
import { MailSettingsComponent } from './mail-settings/mail-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    InboxComponent,
    ComposeMailComponent,
    ReadMailComponent,
    MailSettingsComponent
  ],
  imports: [
    CommonModule,
    EmailRoutingModule,
    SharedModule,
    NgbModule,
    NgSelectModule
  ]
})
export class EmailModule { }
