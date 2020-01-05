import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DownloadService } from 'src/app/services/download.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-popup-three-types',
  templateUrl: './popup-three-types.component.html',
  styleUrls: ['./popup-three-types.component.scss']
})
export class PopupThreeTypesComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupThreeTypesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private download: DownloadService) { }

  ngOnInit() {
  }

  onClose() {
    this.dialogRef.close();
  }

  onDownload(typeFile: string) {
    const data = {
      nameToDownload: this.data.nameToDownload,
      typeFile
    };
    if (typeFile === 'wav') {
      const lastIndexOfPoint = data.nameToDownload.lastIndexOf('.');
      const type = data.nameToDownload.slice(lastIndexOfPoint + 1);
      data.nameToDownload = data.nameToDownload.replace(type, 'wav');
      this.download.downloadFile(data).subscribe(blob => {
        saveAs(blob, `${this.data.name}-${this.data.artist}.wav`);
      }, err => console.log(err));
      this.dialogRef.close();
    } else {
      this.download.downloadFile(data).subscribe(blob => {
        saveAs(blob, `${this.data.name}-${this.data.artist}.mp3`);
      }, err => console.log(err));
      this.dialogRef.close();
    }
  }

}
