import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComposeMailComponent } from './compose-mail/compose-mail.component';
import { InboxComponent } from './inbox/inbox.component';
import { MailSettingsComponent } from './mail-settings/mail-settings.component';
import { ReadMailComponent } from './read-mail/read-mail.component';

const routes: Routes = [
  {path: 'mail', children:[
    {path:'inbox', component: InboxComponent},
    {path:'compose-mail', component: ComposeMailComponent},
    {path:'read-mail', component: ReadMailComponent},
    {path:'mail-settings', component: MailSettingsComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailRoutingModule { }
