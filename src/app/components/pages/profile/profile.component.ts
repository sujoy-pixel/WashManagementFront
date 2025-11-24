import { Component, OnInit } from '@angular/core';
import {
  Gallery,
  ThumbnailsPosition,
  ImageSize,
} from 'ng-gallery';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  constructor(private gallery: Gallery) {}

  ngOnInit(): void {
    // Get a lightbox gallery ref
    const lightboxRef = this.gallery.ref('lightbox');

    // Add custom gallery config to the lightbox (optional)
    lightboxRef.setConfig({
      imageSize: ImageSize.Cover,
      thumbPosition: ThumbnailsPosition.Top,
    });
  }

  images:any[]=[
    { srcUrl: './assets/images/media/1.jpg',
      previewUrl:"assets/images/media/1.jpg"
  },
    { srcUrl: './assets/images/media/4.jpg',
    previewUrl:"./assets/images/media/4.jpg"
  },
    { srcUrl: './assets/images/media/5.jpg',
    previewUrl:"./assets/images/media/5.jpg"
  },
    { srcUrl: './assets/images/media/6.jpg',
    previewUrl:"./assets/images/media/6.jpg"
  },
    { srcUrl: './assets/images/media/7.jpg',
    previewUrl:"./assets/images/media/7.jpg"
  },
    { srcUrl: './assets/images/media/8.jpg',
    previewUrl:"./assets/images/media/8.jpg"
  },
    { srcUrl: './assets/images/media/11.jpg',
    previewUrl:"./assets/images/media/11.jpg"
  },
    { srcUrl: './assets/images/media/10.jpg',
    previewUrl:"./assets/images/media/10.jpg"
  },
    { srcUrl: './assets/images/media/2.jpg',
    previewUrl:"./assets/images/media/2.jpg"
  },
    { srcUrl: './assets/images/media/9.jpg',
    previewUrl:"./assets/images/media/9.jpg"
  },
    { srcUrl: './assets/images/media/12.jpg',
    previewUrl:"./assets/images/media/12.jpg"
  },
    { srcUrl: './assets/images/media/20.jpg',
    previewUrl:"./assets/images/media/20.jpg"
  },
  ]
  
}
