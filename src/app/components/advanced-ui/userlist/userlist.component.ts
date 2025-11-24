import { Component, OnInit, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

// User list interface
export interface UserData {
  id: number;
  photo?:string;
  text?:string;
  textBg?:string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  country: string;
  verification: string;
  verificationStatus: string;
  joinedDate: string;
}

/** UserList data. */

const UserList: UserData[] = [
  {id: 1, photo:'./assets/images/faces/4.jpg', name:'Kelly', email:'kellybelly357@webmail.org', role:'Senior Javascript Developer', lastActive:'36 mins ago', country:'Columbia', verification:'Not Verified', verificationStatus:'danger' ,joinedDate:'13-03-2021' },
  {id: 2, textBg:'success', text:'W', name:'Gaines', email:'gaines.j@hotmail.org', role:'	Office Manager', lastActive:'15 days ago', country:'Romania', verification:'Not Verified', verificationStatus:'danger' ,joinedDate:'27-3-2021' },
  {id: 3, textBg:'secondary', text:'CX', name:'Chandler', email:'chandler.k@mobimail.org', role:'Sales Assistant', lastActive:'28 days ago', country:'China', verification:'Not Verified', verificationStatus:'danger' ,joinedDate:'03-04-2021' },
  {id: 4, photo:'./assets/images/faces/7.jpg', name:'Winters', email:'winters.w345@gmail.org', role:'Front end Designer', lastActive:'20 hrs ago', country:'Greece', verification:'Not Verified', verificationStatus:'danger' ,joinedDate:'11-02-2021' },
  {id: 5, photo:'./assets/images/faces/8.jpg', name:'Ajanto', email:'ajanto.aja445@hotmail.in', role:'Architect', lastActive:'20 days ago', country:'France', verification:'Verified', verificationStatus:'success' ,joinedDate:'23-07-2021' },
  {id: 6, photo:'./assets/images/faces/9.jpg', name:'Satousatti', email:'satousatti3345@gmail.org', role:'Accountant', lastActive:'11 hrs ago', country:'Spain', verification:'Verified', verificationStatus:'success' ,joinedDate:'12-6-2021' },
  {id: 7, textBg:'info', text:'CH', photo:'./assets/images/faces/14.jpg', name:'Williamson', email:'williamson.wilson123@gmail.in', role:'Integration Specialist', lastActive:'21 hrs ago', country:'Bermuda', verification:'Verified', verificationStatus:'success' ,joinedDate:'29-01-2021' },
  {id: 8, photo:'./assets/images/faces/11.jpg', name:'Davidson', email:'davidson.david@hotmail.com', role:'Integration Specialist', lastActive:'14 mins ago', country:'Portugal', verification:'Verified', verificationStatus:'success' ,joinedDate:'19-08-2021' },
  {id: 9, textBg:'warning', text:'H', name:'Frostpup', email:'Frostpup143@gmail.org', role:'	Software Engineer', lastActive:'19 hrs ago', country:'India', verification:'Verified', verificationStatus:'success' ,joinedDate:'31-01-2021' },
  {id: 10, photo:'./assets/images/faces/13.jpg', name:'Flynn', email:'flynn.gov@gmail.in', role:'Support Lead', lastActive:'1 month ago', country:'Japan', verification:'Verified', verificationStatus:'success' ,joinedDate:'23-05-2021' },
  {id: 11, photo:'./assets/images/faces/14.jpg', name:'Marshall', email:'Marshall@maim.com', role:'Regional Director', lastActive:'2 days ago', country:'Mexico', verification:'Verified', verificationStatus:'success' ,joinedDate:'11-07-2021' },
  {id: 12, photo:'./assets/images/faces/15.jpg', name:'Kail', email:'kail@123.org.in', role:'Senior Marketing Designer', lastActive:'12 mins ago', country:'Italy', verification:'Verified', verificationStatus:'success' ,joinedDate:'26-04-2021' },
  {id: 13, photo:'./assets/images/faces/16.jpg', name:'Cox', email:'morenocox.g111@gmail.in', role:'Junior Technical Author', lastActive:'1 month ago', country:'Texas', verification:'Verified', verificationStatus:'success' ,joinedDate:'25-05-2021' },
  {id: 14, photo:'./assets/images/faces/17.jpg', name:'Hurst', email:'Hurst.h@webmail.org.in', role:'Javascript Developer', lastActive:'17 days ago', country:'Iceland', verification:'Verified', verificationStatus:'success' ,joinedDate:'16-04-2021' },
];

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss']
})
export class UserlistComponent implements OnInit {

  displayedColumns: string[] = ['photo', 'name', 'role', 'lastActive', 'country', 'verification', 'joinedDate'];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // assigning USERList to users
    const users = UserList

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(users);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  ngOnInit(): void {
  }

}
