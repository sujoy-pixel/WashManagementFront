import { Component, OnInit } from '@angular/core';

import { ToastrService } from 'ngx-toastr';      // Alert message using NGX toastr
import { CrudService } from 'src/app/shared/services/firebase/crud.service'; // CRUD API service class

export interface Member {
    $key: string;
    firstName: string;
    lastName: string;
    email: string
    mobileNumber: Number;
    designation: string
 }
@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})

export class MemberListComponent implements OnInit {
  p: number = 1;                      // Settup up pagination variable
  Member!: Member[];                 // Save members data in Member's array.
  hideWhenNoMember: boolean = false; // Hide members data table when no member.
  noData: boolean = false;            // Showing No Member Message, when no member in database.
  
  

  constructor(
    public crudApi: CrudService, // Inject member CRUD services in constructor.
    public toastr: ToastrService // Toastr service for alert message
    ){ }


  ngOnInit() {
    this.dataState(); // Initialize member's list, when component is ready
    let s = this.crudApi.GetmembersList(); 
    s.snapshotChanges().subscribe(data => { // Using snapshotChanges() method to retrieve list of data along with metadata($key)
      this.Member = [];
      data.forEach(item => {
        let a:any = item.payload.toJSON(); 
        a['$key'] = item.key;
        this.Member.push(a as Member);
      })
    })
    
  }

  // Using valueChanges() method to fetch simple list of members data. It updates the state of hideWhenNomember, noData variables when any changes occurs in member data list in real-time.
  dataState() {     
    this.crudApi.GetmembersList().valueChanges().subscribe(data => {
      
      if(data.length <= 0){
        this.hideWhenNoMember = false;
        this.noData = true;
      } else {
        this.hideWhenNoMember = true;
        this.noData = false;
      }
    })
  }

  // Method to delete member object
  deletemember(member:any) {
    if (window.confirm('Are sure you want to delete this member ?')) { // Asking from user before Deleting member data.
      this.toastr.error(member.firstName + ' successfully deleted!'); // Alert message will show up when member successfully deleted.
      this.crudApi.Deletemember(member.$key) // Using Delete member API to delete member.
    }
  }

}