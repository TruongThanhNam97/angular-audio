import { Component, OnInit } from '@angular/core';
import { AlertifyService } from 'src/app/services/alertify.service';
import { CloudService } from 'src/app/services/cloud.service';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { DECODE_TOKEN } from 'src/app/interfaces/decode-token';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material';
import { PopupBanComponent } from '../login/popup-ban/popup-ban.component';

@Component({
  selector: 'app-form-upload',
  templateUrl: './form-upload.component.html',
  styleUrls: ['./form-upload.component.css']
})
export class FormUploadComponent implements OnInit {

  uploader: FileUploader;

  hasBaseDropZoneOver = false;

  currentUser: DECODE_TOKEN;

  constructor(
    private alertify: AlertifyService,
    private cloudService: CloudService,
    private authService: AuthService,
    public dialog: MatDialog
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
      autoUpload: false,
      authToken: localStorage.getItem('jwtToken')
    });

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };

    this.uploader.onSuccessItem = (item, res: any, status, headers) => {
      if (res) {
        // Here to catch data from server
        res = JSON.parse(res);
        const song = {
          url: `${environment.SERVER_URL_SOUND}${res.song.url}`,
          name: res.song.name,
          artist: res.song.artist,
          userId: res.song.userId,
          userName: res.song.userName
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
        console.log(err);
        if (err.error.numberOfReup >= 3) {
          this.authService.logOut();
          this.dialog.open(PopupBanComponent, { data: 'Your account is banned' });
        }
        if (err.error.err !== 'Cannot upload music') {
          this.alertify.error(err.error.err);
        }
      }
    };
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

}
