import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { PlayerComponent } from '../player.component';
import { PopupThreeTypesComponent } from '../popup-three-types/popup-three-types.component';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PlayerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  downloadFile() {
    this.dialog.open(PopupThreeTypesComponent, { data: this.data });
    this.dialogRef.close();
  }

}
