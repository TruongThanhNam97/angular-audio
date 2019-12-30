import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-popup-ban',
  templateUrl: './popup-ban.component.html',
  styleUrls: ['./popup-ban.component.scss']
})
export class PopupBanComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupBanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  onOkClick() {
    this.dialogRef.close();
  }

}
