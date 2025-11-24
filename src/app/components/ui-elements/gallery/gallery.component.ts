import { Component, OnInit } from '@angular/core';
import { Gallery, GalleryItem, ImageItem } from 'ng-gallery';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  
  items!: GalleryItem[];

  imageData = data;

  constructor(public gallery: Gallery) {}

  ngOnInit() {

    // Creat gallery items
    this.items = this.imageData.map(
      (item) => new ImageItem({ src: item.srcUrl, thumb: item.previewUrl })
    );
  }
}

const data = [
  {
    srcUrl: './assets/images/media/8.jpg',
    previewUrl: './assets/images/media/8.jpg',
  },
  {
    srcUrl: './assets/images/media/10.jpg',
    previewUrl: './assets/images/media/10.jpg',
  },
  {
    srcUrl: './assets/images/media/11.jpg',
    previewUrl: './assets/images/media/11.jpg',
  },
  {
    srcUrl: './assets/images/media/12.jpg',
    previewUrl: './assets/images/media/12.jpg',
  },
  {
    srcUrl: './assets/images/media/13.jpg',
    previewUrl: './assets/images/media/13.jpg',
  },
  {
    srcUrl: './assets/images/media/14.jpg',
    previewUrl: './assets/images/media/14.jpg',
  },
  {
    srcUrl: './assets/images/media/15.jpg',
    previewUrl: './assets/images/media/15.jpg',
  },
  {
    srcUrl: './assets/images/media/16.jpg',
    previewUrl: './assets/images/media/16.jpg',
  },
  {
    srcUrl: './assets/images/media/17.jpg',
    previewUrl: './assets/images/media/17.jpg',
  },
  {
    srcUrl: './assets/images/media/18.jpg',
    previewUrl: './assets/images/media/18.jpg',
  },
  {
    srcUrl: './assets/images/media/19.jpg',
    previewUrl: './assets/images/media/19.jpg',
  },
  {
    srcUrl: './assets/images/media/20.jpg',
    previewUrl: './assets/images/media/20.jpg',
  },
];
