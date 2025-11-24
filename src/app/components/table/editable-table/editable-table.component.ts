import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AdddialogBoxComponent } from './adddialog-box.component';

export interface UsersData {
  name: string;
  id: number;
}

const ELEMENT_DATA: UsersData[] = [
  {id: 1560608769632, name: 'Artificial Intelligence'},
  {id: 1560608796014, name: 'Machine Learning'},
  {id: 1560608787815, name: 'Robotic Process Automation'},
  {id: 1560608805101, name: 'Blockchain'}
];
@Component({
  selector: 'app-editable-table',
  templateUrl: './editable-table.component.html',
  styleUrls: ['./editable-table.component.scss']
})
export class EditableTableComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'action'];
  dataSource = ELEMENT_DATA;

  @ViewChild(MatTable,{static:true}) table!: MatTable<any>;

  constructor(public dialog: MatDialog) {}

  openDialog(action:any,obj:any) {
    obj.action = action;
    const dialogRef = this.dialog.open(AdddialogBoxComponent, {
      width: '80%',
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {

      if(result){
        switch (result.event){
          case 'Add':
            this.addRowData(result.data);
            break;
          case 'Update':
            this.updateRowData(result.data);
            break;
          case 'Delete':
            this.deleteRowData(result.data);
            break;
          default:
            return;
        }
      }

    });
  }

  addRowData(row_obj:any){
    var d = new Date();
    this.dataSource.push({
      id:d.getTime(),
      name:row_obj.name
    });
    this.table.renderRows();

  }
  updateRowData(row_obj:any){
    this.dataSource = this.dataSource.filter((value,key)=>{
      if(value.id == row_obj.id){
        value.name = row_obj.name;
      }
      return true;
    });
  }
  deleteRowData(row_obj:any){
    this.dataSource = this.dataSource.filter((value,key)=>{
      return value.id != row_obj.id;
    });
  }

  ngOnInit() {

  }

}
