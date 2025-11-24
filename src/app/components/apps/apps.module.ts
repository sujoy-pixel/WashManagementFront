import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppsRoutingModule } from './apps-routing.module';
import { CalendarComponent } from './calendar/calendar.component';
import { ChatComponent } from './chat/chat.component';
import { TicketsComponent } from './tickets/tickets.component';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { EmailModule } from './email/email.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { ClientsModule } from './clients/clients.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgSelectModule } from '@ng-select/ng-select';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelPropagation: false
};


@NgModule({
  declarations: [
    CalendarComponent,
    ChatComponent,
    TicketsComponent
  ],
  imports: [
    CommonModule,
    AppsRoutingModule,
    EcommerceModule,
    FileManagerModule,
    EmailModule,
    InvoicesModule,
    ProjectsModule,
    TasksModule,
    ClientsModule,
    SharedModule,
    NgbModule,
    FormsModule, ReactiveFormsModule,
    PerfectScrollbarModule,
    NgSelectModule,    
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class AppsModule { }
