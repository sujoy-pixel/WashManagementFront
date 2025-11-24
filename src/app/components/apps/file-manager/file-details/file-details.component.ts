import { Component, OnInit } from '@angular/core';
import { Gallery, GalleryItem, ImageItem,  } from 'ng-gallery';

@Component({
  selector: 'app-file-details',
  templateUrl: './file-details.component.html',
  styleUrls: ['./file-details.component.scss']
})
export class FileDetailsComponent implements OnInit {
  items!: GalleryItem[];
  imageData = data;
  constructor(public gallery: Gallery) { }

  ngOnInit(): void {
    // Creat gallery items
    this.items = this.imageData.map(item => new ImageItem({ src: item.srcUrl, thumb: item.previewUrl }));
  }

}

const data = [
  {
    srcUrl: './assets//images/media/1.jpg',
    previewUrl: './assets//images/media/1.jpg'
  },
  {
    srcUrl: './assets//images/media/4.jpg',
    previewUrl: './assets//images/media/4.jpg'
  },
  {
    srcUrl: './assets//images/media/5.jpg',
    previewUrl: './assets//images/media/5.jpg'
  },
  {
    srcUrl: './assets//images/media/6.jpg',
    previewUrl: './assets//images/media/6.jpg'
  },
  {
    srcUrl: './assets//images/media/7.jpg',
    previewUrl: './assets//images/media/7.jpg'
  },
  {
    srcUrl: './assets//images/media/8.jpg',
    previewUrl: './assets//images/media/8.jpg'
  },
  {
    srcUrl: './assets//images/media/11.jpg',
    previewUrl: './assets//images/media/11.jpg'
  },
  {
    srcUrl: './assets//images/media/10.jpg',
    previewUrl: './assets//images/media/10.jpg'
  },
  {
    srcUrl: './assets//images/media/2.jpg',
    previewUrl: './assets//images/media/2.jpg'
  },
];