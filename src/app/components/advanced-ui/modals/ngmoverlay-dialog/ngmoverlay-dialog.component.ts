import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  food: string;
  name: string;
}


@Component({
  selector: 'app-ngmoverlay-dialog',
  templateUrl: './ngmoverlay-dialog.component.html',
  styleUrls: ['./ngmoverlay-dialog.component.scss']
})
export class NGMOverlayDialogComponent implements OnInit {

  food!: string;
  name!: string;

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverview, {
      width: '50%',
      data: {name: this.name, food: this.food},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.food = result;
    });
  }
  ngOnInit(): void {
  }

}

@Component({
  selector: 'dialog-overvie',
  template: `
  <h1 mat-dialog-title>Hi {{data.name}}</h1>
    <div mat-dialog-content>
      <p>What's your favorite food?</p>
      <mat-form-field appearance="fill">
        <mat-label>Favorite food</mat-label>
        <input matInput [(ngModel)]="data.food">
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">No Thanks</button>
      <button mat-button [mat-dialog-close]="data.food" cdkFocusInitial>Ok</button>
    </div>

  `,
})
export class DialogOverview {
  constructor(
    public dialogRef: MatDialogRef<DialogOverview>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}