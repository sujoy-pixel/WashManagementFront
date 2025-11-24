import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-ngmdropdown-dialog',
  templateUrl: './ngmdropdown-dialog.component.html',
  styleUrls: ['./ngmdropdown-dialog.component.scss']
})
export class NGMDropdownDialogComponent implements OnInit {

  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;

  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(DialogMenuDialog, {restoreFocus: false});

    // Manually restore focus to the menu trigger since the element that
    // opens the dialog won't be in the DOM any more when the dialog closes.
    dialogRef.afterClosed().subscribe(() => this.menuTrigger.focus());
  }
  ngOnInit(): void {
    
  }
}

@Component({
  selector: 'dialog-from-menu-dialog',
  template: `
    <mat-dialog-content>
    This is a dialog
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button mat-dialog-close>Okay</button>
  </mat-dialog-actions>
`,
})
export class DialogMenuDialog {}