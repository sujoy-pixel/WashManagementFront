import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { ChatComponent } from './chat/chat.component';
import { TicketsComponent } from './tickets/tickets.component';

const routes: Routes = [
  {path:'', children:[
    {path: 'calendar', component: CalendarComponent},
    {path: 'chat', component: ChatComponent},
    {path: 'tickets', component: TicketsComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsRoutingModule { }
