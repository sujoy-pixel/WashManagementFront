import { Component, OnInit } from '@angular/core';

interface list{
  id:number;
  img: string;
  title: string;
  size: string
}
interface RecentFilesType{
  id:number;
  img: string;
  fileName: string;
  dateModified: string;
  type: string;
  size: string;
}

const FilesListData:list[]=[
  {id:1, img:'fa fa-picture-o', title:'Images', size:'14.2 mb'},
  {id:2, img:'fa fa-video-camera', title:'Videos', size:'212 mb'},
  {id:3, img:'fa fa-file-text', title:'Docs', size:'34 mb'},
  {id:4, img:'fa fa-music', title:'Music', size:'1.5 gb'},
  {id:5, img:'fa fa-database', title:'Apks', size:'550 mb'},
  {id:6, img:'fa fa-download', title:'Downloads', size:'10.8 mb'},
  {id:7, img:'fa fa-commenting', title:'Chat', size:'1.5 gb'},
  {id:8, img:'fa fa-th-large', title:'More', size:'16 gb'},
]

const RecentFilesData: RecentFilesType[]=[
  {id:1, img:'fa fa-file-text', fileName:'noa documentation', dateModified:'07/10/21, 09:30', type:'doc', size:'15kb'},
  {id:2, img:'fa fa-video-camera', fileName:'sample video', dateModified:'07/10/21, 11:30', type:'	mp4', size:'30mb'},
  {id:3, img:'fa fa-picture-o', fileName:'sample image', dateModified:'07/10/21, 01:30', type:'	jpeg', size:'15kb'},
  {id:4, img:'fa fa-file-text', fileName:'word document', dateModified:'07/10/21, 02:30', type:'doc', size:'15kb'},
  {id:5, img:'fa fa-music', fileName:'sample audio', dateModified:'07/10/21, 03:00', type:'	mp3', size:'5.3mb'},
  {id:6, img:'fa fa-video-camera', fileName:'sample video', dateModified:'07/10/21, 04:30', type:'	mp4', size:'30mb'},
  {id:7, img:'fa fa-picture-o', fileName:'sample image', dateModified:'07/10/21, 05:30', type:'	jpeg', size:'15kb'},
]

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  FilesList!:list[];
  RecentFilesList!:RecentFilesType[];
  constructor() { }

  ngOnInit(): void {
    this.FilesList = FilesListData
    this.RecentFilesList = RecentFilesData
  }
}
