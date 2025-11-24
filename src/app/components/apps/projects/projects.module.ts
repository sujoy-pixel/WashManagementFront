import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { ProjectNewComponent } from './project-new/project-new.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectListService } from './project-list/project-list.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxEditorModule } from 'ngx-editor';


@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectListComponent,
    ProjectDetailsComponent,
    EditProjectComponent,
    ProjectNewComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxDropzoneModule,
    NgxEditorModule
  ],
  providers:[
    DecimalPipe,
    ProjectListService
  ]
})
export class ProjectsModule { }
