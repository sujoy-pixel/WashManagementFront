import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { ColorPickerService } from 'ngx-color-picker';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { DialogModule } from 'primeng/dialog';
import { DatePipe } from '@angular/common';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { HeaderComponent } from './pages/common/header/header.component';
import { FooterComponent } from './pages/common/footer/footer.component';
import { BannerComponent } from './pages/common/banner/banner.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BoldReportViewerModule } from '@boldreports/angular-reporting-components';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';

import '@boldreports/javascript-reporting-controls/Scripts/bold.report-viewer.min';
import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.bulletgraph.min';
import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.chart.min';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatCheckboxModule } from '@angular/material/checkbox';
@NgModule({ declarations: [
        AppComponent,
        HomePageComponent,
        HeaderComponent,
        FooterComponent,
        BannerComponent
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA], imports: [
        BsDatepickerModule.forRoot(),
        BoldReportViewerModule,
        FormsModule,
        NgSelectModule,
        DialogModule,
        TypeaheadModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AngularFireAuthModule,
        AngularFireDatabaseModule,
        ToastrModule.forRoot({
            enableHtml: true, // Allows HTML in toast messages
        }),
        ReactiveFormsModule,
        PanelModule,
        TableModule,
        CommonModule,
        NgSelectModule,
        BsDatepickerModule.forRoot(),
        CalendarModule, // Ensure this module is imported
        CardModule,
        MultiSelectModule,
        MatCheckboxModule], providers: [ColorPickerService, DatePipe, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {
  //MatTabsModule
}
