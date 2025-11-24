import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.scss']
})
export class EditProjectComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  // with search

  
  projectCategory = [
    { id: 1, name: 'Nonumy' },
    { id: 2, name: 'Sea' },
    { id: 3, name: 'Vero' },
    { id: 4, name: 'Dolore' },
    { id: 5, name: 'Lorem' },
    { id: 6, name: 'Eos' },
  ];

  selectedProjectCategory = this.projectCategory[0].name;
  //  Department
  Department = [
    { id: 1, name: 'IT Development' },
    { id: 2, name: 'Sales' },
    { id: 3, name: 'Marketing' },
    { id: 4, name: 'Finance' },
    { id: 5, name: 'Stocks' },
    { id: 6, name: 'Medical' },
    { id: 7, name: 'Human Resources' },
  ];

  selectedDepartment = this.Department[0].name;
  // Client
  Client = [
    { id: 1, name: 'Angeline Julliet' },
    { id: 2, name: 'Helena Rose' },
    { id: 3, name: 'Daniel Obrien' },
    { id: 4, name: 'Jorah Randy' },
    { id: 5, name: 'Emma Watson' },
    { id: 6, name: 'Bonny Benett' },
    { id: 7, name: 'Jessie Spears' },
    { id: 8, name: 'Skyler Hilda' },
    { id: 9, name: 'Randy Orton' },
    { id: 10, name: 'Benjamin Button' },
  ];

  selectedClient = this.Client[0].name;
  //
   
  AssignedTo = [
    {
      id: 1,
      name: 'Angeline Julliet',
      avatar:'./assets/images/users/1.jpg',
    },
    {
      id: 2,
      name: 'Helena Rose',
      avatar:'./assets/images/users/2.jpg'
    },
    {
      id: 3,
      name: 'Daniel Obrien',
      avatar:'./assets/images/users/13.jpg'
    },
    {
      id: 4,
      name: 'Jorah Randy',
      avatar:'./assets/images/users/15.jpg',
    },
    {
      id: 5,
      name: 'Emma Watson',
      avatar:'./assets/images/users/3.jpg',
    },
    {
      id: 6,
      name: 'Bonny Benett',
      avatar:'./assets/images/users/5.jpg'
    },
    {
      id: 7,
      name: 'Jessie Spears',
      avatar:'./assets/images/users/7.jpg'
    },
    {
      id: 8,
      name: 'Skyler Hilda',
      avatar:'./assets/images/users/9.jpg',
    },
    {
      id: 9,
      name: 'Randy Orton',
      avatar:'./assets/images/users/11.jpg'
    },
    {
      id: 10,
      name: 'Benjamin Button',
      avatar:'./assets/images/users/14.jpg',
    },
  ];

  AssignedToList = this.AssignedTo[0].name;

  //ngx-dropzone
  files: File[] = [];

  onSelect(event: any) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }

  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
}
