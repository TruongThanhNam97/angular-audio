import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PlayerComponent } from '../player.component';
import { DownloadService } from 'src/app/services/download.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PlayerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private download: DownloadService
  ) { }

  ngOnInit() {
  }

  downloadFile() {
    this.download.downloadFile(this.data.nameToDownload).subscribe(blob => {
      saveAs(blob, `${this.data.nameToDownload.split('~!~')[1]}`);
    }, err => console.log(err));
    this.dialogRef.close();
  }

}
