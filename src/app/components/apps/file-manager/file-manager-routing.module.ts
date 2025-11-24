import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileDetailsComponent } from './file-details/file-details.component';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { FilesComponent } from './files/files.component';

const routes: Routes = [
  {path:'file-manager', children:[
    {path:'files', component: FilesComponent},
    {path:'file-manager', component: FileManagerComponent},
    {path:'file-details', component: FileDetailsComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileManagerRoutingModule { }
