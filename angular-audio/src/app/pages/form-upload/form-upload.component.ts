import { Component, OnInit } from '@angular/core';
import { UploadService } from 'src/app/services/upload.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { CloudService } from 'src/app/services/cloud.service';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-form-upload',
  templateUrl: './form-upload.component.html',
  styleUrls: ['./form-upload.component.css']
})
export class FormUploadComponent implements OnInit {

  uploader: FileUploader;

  hasBaseDropZoneOver = false;

  constructor(
    private uploadService: UploadService,
    private alertify: AlertifyService,
    private cloudService: CloudService
  ) { }

  ngOnInit() {
    this.initializeUploader();
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: `${environment.SERVER_URL}upload`,
      isHTML5: true,
      allowedFileType: ['audio'],
      removeAfterUpload: true,
      autoUpload: false
    });

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };

    this.uploader.onSuccessItem = (item, res: any, status, headers) => {
      if (res) {
        // Here to catch data from server
        res = JSON.parse(res);
        const song = {
          url: `${environment.SERVER_URL_SOUND}${res.song.url}`,
          name: res.song.name,
          artist: res.song.artist
        };
        this.cloudService.allowGetSongs = false;
        this.cloudService.addSongToLocalSongs(song);
        const songName = res.song.name;
        this.alertify.success(`Song name: ${songName} has been processed`);
      }
    };

    this.uploader.onErrorItem = (item, err: any, status, headers) => {
      if (err) {
        // Here to catch error from server
        err = JSON.parse(err);
        this.alertify.error(err.error);
      }
    };
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

}
