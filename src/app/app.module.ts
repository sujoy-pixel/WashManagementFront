import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { ColorPickerService } from 'ngx-color-picker';
import { ToastrModule } from 'ngx-toastr';
//import { MascoschoolModule } from './components/mascoschool/mascoschool.module';
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
import { NgxChartsModule } from '@swimlane/ngx-charts';
// import {TypeaheadModule} from 'ng2-bootstrap/components/typeahead';
// import {DropdownModule} from 'primeng/dropdown';
//import { MatTabsModule } from '@angular/material/tabs';
//import { MascocommercialComponent } from './mascocommercial.component';

//import { AdmissionFormComponent } from './components/mascoschool/admission-form/admission-form.component';
//import { TestComponent } from './components/mascoschool/test/test.component';
//import { StudentPreviousInstituteComponent } from './components/mascoschool/student-previous-institute/student-previous-institute.component';
// Report viewer
import '@boldreports/javascript-reporting-controls/Scripts/bold.report-viewer.min';
// data-visualization
import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.bulletgraph.min';
import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.chart.min';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatCheckboxModule } from '@angular/material/checkbox';
@NgModule({
  declarations: [
    // TypeaheadModule,
    AppComponent,
    HomePageComponent,
    HeaderComponent,
    FooterComponent,
    BannerComponent,
  
    //FormsModule

    //AdmissionFormComponent,
    //TestComponent,
    // StudentPreviousInstituteComponent,
  ],
  imports: [
    // DropdownModule,
    // Component,
    //PrimeNGConfig,
    BsDatepickerModule.forRoot(),
    BoldReportViewerModule,
    FormsModule,
    // MatTabsModule,
    NgSelectModule,
    DialogModule,
    TypeaheadModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    SimpleNotificationsModule.forRoot(),
    //ToastrModule.forRoot(),
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
    NgxChartsModule,
    MultiSelectModule,
    MatCheckboxModule
  ],
  providers: [ColorPickerService, DatePipe],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  //MatTabsModule
}
