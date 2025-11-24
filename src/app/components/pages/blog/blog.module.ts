import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogRoutingModule } from './blog-routing.module';
import { BlogComponent } from './blog/blog.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { EditPostComponent } from './edit-post/edit-post.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';


@NgModule({
  declarations: [
    BlogComponent,
    BlogDetailsComponent,
    EditPostComponent
  ],
  imports: [
    CommonModule,
    BlogRoutingModule,
    SharedModule,
    NgbModule,
    NgSelectModule,
    NgxDropzoneModule,
    GalleryModule.withConfig({
      // thumbView: 'contain',
    }),
    LightboxModule,
  ]
})
export class BlogModule { }
