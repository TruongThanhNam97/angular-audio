import { Component, OnInit } from '@angular/core';
import { AlertifyService } from 'src/app/services/alertify.service';
import { environment } from 'src/environments/environment';
import { DECODE_TOKEN } from 'src/app/interfaces/decode-token';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material';
import { PopupBanComponent } from '../login/popup-ban/popup-ban.component';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { UploadService } from 'src/app/services/upload.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-form-upload',
  templateUrl: './form-upload.component.html',
  styleUrls: ['./form-upload.component.css']
})
export class FormUploadComponent implements OnInit {

  hasBaseDropZoneOver = false;

  currentUser: DECODE_TOKEN;

  SERVER_URL: string;

  signForm: FormGroup;

  destroySubscription$: Subject<boolean> = new Subject();

  typeFileMusic = ['mp3', 'MP3', 'wav', 'WAV'];

  constructor(
    private alertify: AlertifyService,
    private authService: AuthService,
    public dialog: MatDialog,
    private uploadService: UploadService
  ) {
    this.SERVER_URL = environment.SERVER_URL;
  }

  ngOnInit() {
    this.initializeForm();
  }

  onSelectFile(e) {
    if (e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const song = file.name.split('.')[0];
        const formGroup = new FormGroup({
          name: new FormControl(song.split('-')[0], [Validators.required, Validators.maxLength(50)]),
          artist: new FormControl(song.split('-')[1], [Validators.required, Validators.maxLength(50)]),
          file: new FormControl(file, [this.validateFile.bind(this)])
        });
        (this.signForm.get('arrSongs') as FormArray).push(formGroup);
      }
    }
  }

  validateFile(control: FormControl): { [key: string]: boolean } {
    if (control) {
      const typeFile = control.value.name.split('.')[1];
      return this.typeFileMusic.includes(typeFile) ? null : { invalid: true };
    }
  }

  initializeForm() {
    this.signForm = new FormGroup({
      arrSongs: new FormArray([])
    });
  }

  getControls() {
    return (this.signForm.get('arrSongs') as FormArray).controls;
  }

  onSave(control: FormControl, index: number) {
    const formData = new FormData();
    formData.append('name', control.value.name);
    formData.append('artist', control.value.artist);
    formData.append('file', control.value.file);
    this.alertify.success('Waiting processing');
    this.uploadService.uploadSong(formData).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(
      (res: any) => {
        const songName = res.song.name;
        this.alertify.success(`Song name: ${songName} has been processed`);
      },
      err => {
        if (err.error.error.numberOfReup >= 3) {
          this.authService.logOut();
          this.dialog.open(PopupBanComponent, { data: 'Your account is banned' });
        }
        if (err.error.error.err !== 'Cannot upload music') {
          this.alertify.error(err.error.error.err);
        }
      }
    );
    (this.signForm.get('arrSongs') as FormArray).removeAt(index);
  }

  onRemove(index: number) {
    (this.signForm.get('arrSongs') as FormArray).removeAt(index);
  }

}
