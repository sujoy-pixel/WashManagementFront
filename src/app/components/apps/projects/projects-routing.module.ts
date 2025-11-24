import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectNewComponent } from './project-new/project-new.component';
import { ProjectsComponent } from './projects/projects.component';

const routes: Routes = [
  {path:'projects', children:[
    {path:'projects', component: ProjectsComponent},
    {path:'project-list', component: ProjectListComponent},
    {path:'project-details', component: ProjectDetailsComponent},
    {path:'project-new', component: ProjectNewComponent},
    {path:'edit-project', component: EditProjectComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
