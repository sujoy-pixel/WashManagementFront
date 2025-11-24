import { Component, OnInit } from '@angular/core';
import { Gallery, GalleryItem, ImageItem } from 'ng-gallery';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent implements OnInit {
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
    srcUrl: './assets//images/photos/blog10.jpg',
    previewUrl: './assets//images/photos/blog10.jpg'
  },
  {
    srcUrl: './assets//images/photos/blog11.jpg',
    previewUrl: './assets//images/photos/blog11.jpg',
  },
  {
    srcUrl: './assets//images/photos/blog3.jpg',
    previewUrl: './assets//images/photos/blog3.jpg',
  },
  {
    srcUrl: './assets//images/photos/blog4.jpg',
    previewUrl: './assets//images/photos/blog4.jpg',
  },
  {
    srcUrl: './assets//images/photos/blog6.jpg',
    previewUrl: './assets//images/photos/blog6.jpg',
  },
  {
    srcUrl: './assets//images/photos/blog5.jpg',
    previewUrl: './assets//images/photos/blog5.jpg',
  },
  {
    srcUrl: './assets//images/photos/blog7.jpg',
    previewUrl: './assets//images/photos/blog7.jpg',
  },
  {
    srcUrl: './assets//images/photos/blog8.jpg',
    previewUrl: './assets//images/photos/blog8.jpg',
  },
  {
    srcUrl: './assets//images/photos/blog9.jpg',
    previewUrl: './assets//images/photos/blog9.jpg',
  },
];
