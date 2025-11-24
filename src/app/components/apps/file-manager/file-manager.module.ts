import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileManagerRoutingModule } from './file-manager-routing.module';
import { FilesComponent } from './files/files.component';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { FileDetailsComponent } from './file-details/file-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';
import { NgxDropzoneModule } from 'ngx-dropzone';


@NgModule({
  declarations: [
    FilesComponent,
    FileManagerComponent,
    FileDetailsComponent
  ],
  imports: [
    CommonModule,
    FileManagerRoutingModule,
    SharedModule,
    NgbModule,    
    GalleryModule.withConfig({
      // thumbView: 'contain',
    }),
    LightboxModule,
    NgxDropzoneModule
  ]
})
export class FileManagerModule { }
