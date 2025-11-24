import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormAdvancedComponent } from './form-advanced/form-advanced.component';
import { FormEditorComponent } from './form-editor/form-editor.component';
import { FormElementsComponent } from './form-elements/form-elements.component';
import { FormLayoutsComponent } from './form-layouts/form-layouts.component';
import { FormValidationComponent } from './form-validation/form-validation.component';
import { FormWizardComponent } from './form-wizard/form-wizard.component';

const routes: Routes = [
  {
    path:'',
    children:[
      {path:'form-elements', component: FormElementsComponent},
      {path:'form-layouts', component: FormLayoutsComponent},
      {path:'form-validation', component: FormValidationComponent},
      {path:'form-advanced', component: FormAdvancedComponent},
      {path:'form-editors', component: FormEditorComponent},
      {path:'form-wizard', component: FormWizardComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormsRoutingModule { }
