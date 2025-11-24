import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsRoutingModule } from './forms-routing.module';
import { FormElementsComponent } from './form-elements/form-elements.component';
import { FormLayoutsComponent } from './form-layouts/form-layouts.component';
import { FormValidationComponent } from './form-validation/form-validation.component';
import { FormAdvancedComponent } from './form-advanced/form-advanced.component';
import { FormWizardComponent } from './form-wizard/form-wizard.component';
import { MatInputMaskComponent } from './form-elements/mat-input-mask/mat-input-mask.component';
import { FormEditorComponent } from './form-editor/form-editor.component';

import { SharedModule } from 'src/app/shared/shared.module';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { ColorPickerModule } from 'ngx-color-picker';
import {MatSliderModule} from '@angular/material/slider';
import {MatCardModule} from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatStepperModule} from '@angular/material/stepper';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserService } from './form-validation/user.service';
import { MatSelectModule } from '@angular/material/select';
import { NgxDropzoneModule } from 'ngx-dropzone';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import { DataService } from './form-advanced/data.service';
import { HttpClientModule } from '@angular/common/http';
import { QuillModule } from 'ngx-quill';
import { NgxEditorModule } from "ngx-editor";
import { AngularEditorModule } from '@kolkov/angular-editor';
import { EditableStepComponent } from './form-wizard/editable-step/editable-step.component';
import { ErroInStepComponent } from './form-wizard/erro-in-step/erro-in-step.component';
import { VerticalContentComponent } from './form-wizard/vertical-content/vertical-content.component';
import { ResponsiveStepperComponent } from './form-wizard/responsive-stepper/responsive-stepper.component';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | any = null;

@NgModule({
  declarations: [
    FormElementsComponent,
    FormLayoutsComponent,
    FormValidationComponent,
    FormAdvancedComponent,
    FormEditorComponent,
    FormWizardComponent,
    MatInputMaskComponent,
    EditableStepComponent,
    ErroInStepComponent,
    VerticalContentComponent,
    ResponsiveStepperComponent
  ],
  imports: [
    CommonModule,
    FormsRoutingModule,
    HttpClientModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    NgxMaskModule.forRoot(),
    ColorPickerModule,
    MatSliderModule, MatCardModule, MatFormFieldModule, MatCheckboxModule, MatInputModule, MatIconModule,MatSelectModule, MatDatepickerModule,MatNativeDateModule, MatStepperModule,
    NgSelectModule, NgxDropzoneModule,
    QuillModule.forRoot(), NgxEditorModule,  AngularEditorModule
  ],
  providers:[
    UserService,
    DataService
  ]
})
export class FormModule { }
