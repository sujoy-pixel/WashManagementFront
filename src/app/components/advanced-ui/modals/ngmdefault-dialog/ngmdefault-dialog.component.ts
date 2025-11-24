import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ngmdefault-dialog',
  templateUrl: './ngmdefault-dialog.component.html',
  styleUrls: ['./ngmdefault-dialog.component.scss']
})
export class NGMDefaultDialogComponent implements OnInit {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(BasicDialogContent);

    dialogRef.afterClosed().subscribe((result:any) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  ngOnInit(): void {
  }

}


@Component({
  selector: 'default-dialog-content',
  template: `
  <h2 mat-dialog-title>Default Dialog</h2>
  <mat-dialog-content class="mat-typography">
    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p>
      <p>Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
      <p>Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Save</button>
  </mat-dialog-actions>

  `
})
export class BasicDialogContent {}
