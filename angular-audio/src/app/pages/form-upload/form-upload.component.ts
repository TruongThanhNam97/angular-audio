import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertifyService } from 'src/app/services/alertify.service';
import { environment } from 'src/environments/environment';
import { DECODE_TOKEN } from 'src/app/interfaces/decode-token';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material';
import { PopupBanComponent } from '../login/popup-ban/popup-ban.component';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { UploadService } from 'src/app/services/upload.service';
import { takeUntil, take } from 'rxjs/operators';
import { Subject, concat, merge } from 'rxjs';
import { CategoryService } from 'src/app/services/categories.service';

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

  typeFileMusic = ['mp3', 'MP3', 'wav', 'WAV', 'm4a', 'M4A', 'flac', 'FLAC'];

  categories: any;

  chooseFileMode: boolean;

  constructor(
    private alertify: AlertifyService,
    private authService: AuthService,
    public dialog: MatDialog,
    private uploadService: UploadService,
    private categoryService: CategoryService
  ) {
    this.SERVER_URL = environment.SERVER_URL;
  }

  ngOnInit() {
    this.chooseFileMode = this.uploadService.getChooseFileMode();
    this.initializeForm();
    this.uploadService.getChooseFileModeSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(mode => this.chooseFileMode = mode);
  }

  onSelectFile(e) {
    if (e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const lastIndex = file.name.lastIndexOf('.');
        const song = file.name.slice(0, lastIndex);
        const formGroup = new FormGroup({
          name: new FormControl(song.split('-')[0], [Validators.required, Validators.maxLength(50)]),
          artist: new FormControl(song.split('-')[1], [Validators.required, Validators.maxLength(50)]),
          file: new FormControl(file, [this.validateFile.bind(this), this.validateFileSize.bind(this)])
        });
        (this.signForm.get('arrSongs') as FormArray).push(formGroup);
      }
    }
    e.target.value = null;
  }

  validateFile(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      const lastIndex = control.value.name.lastIndexOf('.');
      const typeFile = control.value.name.slice(lastIndex + 1);
      return this.typeFileMusic.includes(typeFile) ? null : { invalid: true };
    }
  }

  validateFileSize(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      const fileSize = (control.value.size / 1000000).toFixed(1);
      return +fileSize <= 60 ? null : { invalidSize: true };
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

  onRemove(index: number) {
    (this.signForm.get('arrSongs') as FormArray).removeAt(index);
  }

  getStatusOfArrSongs() {
    return (this.signForm.get('arrSongs') as FormArray).invalid;
  }

  saveAll() {
    const arrOb$ = [];
    let arrNameArtist = [];
    const arrSongs = (this.signForm.get('arrSongs') as FormArray).value;
    this.uploadService.setAllQueueProcessing(arrSongs.length);
    if (arrSongs.length <= 5) {
      const formData = new FormData();
      arrSongs.forEach(song => {
        arrNameArtist.push({ name: song.name, artist: song.artist });
        formData.append('file', song.file);
      });
      formData.append('arrNameArtist', JSON.stringify(arrNameArtist));
      this.chooseFileMode = false;
      this.uploadService.setChooseFileMode(false);
      this.uploadService.uploadSong(formData).subscribe(
        (user: any) => {
          if (user.numberOfReup !== 0) {
            localStorage.setItem('reup', user.numberOfReup);
            this.authService.updateReupDectected(user.numberOfReup);
            if (user.numberOfReup >= 3) {
              this.authService.logOut();
              this.dialog.open(PopupBanComponent, { data: 'Your account is banned' });
            }
          }
        },
        err => {
          this.alertify.success('Complete processing');
          this.uploadService.resetProcessing();
          this.chooseFileMode = true;
          this.uploadService.setChooseFileMode(true);
        },
        () => {
          this.alertify.success('Complete processing');
          this.uploadService.resetProcessing();
          this.chooseFileMode = true;
          this.uploadService.setChooseFileMode(true);
        }
      );
    } else {
      let formData = new FormData();
      let count = 0;
      arrSongs.forEach((song, index, arr) => {
        count++;
        if (count === 5 || index === arr.length - 1) {
          arrNameArtist.push({ name: song.name, artist: song.artist });
          formData.append('arrNameArtist', JSON.stringify(arrNameArtist));
          formData.append('file', song.file);
          arrOb$.push(this.uploadService.uploadSong(formData));
          count = 0;
          formData = new FormData();
          arrNameArtist = [];
        } else {
          arrNameArtist.push({ name: song.name, artist: song.artist });
          formData.append('file', song.file);
        }
      });
      this.chooseFileMode = false;
      this.uploadService.setChooseFileMode(false);
      concat(...arrOb$).subscribe(
        (user: any) => {
          this.uploadService.minusQueueProcessing();
          if (user.numberOfReup !== 0) {
            localStorage.setItem('reup', user.numberOfReup);
            this.authService.updateReupDectected(user.numberOfReup);
            if (user.numberOfReup >= 3) {
              this.authService.logOut();
              this.uploadService.resetProcessing();
              this.chooseFileMode = true;
              this.uploadService.setChooseFileMode(true);
              this.dialog.open(PopupBanComponent, { data: 'Your account is banned' });
            }
          }
        },
        err => {
          this.alertify.success('Complete processing');
          this.uploadService.resetProcessing();
          this.chooseFileMode = true;
          this.uploadService.setChooseFileMode(true);
        },
        () => {
          this.alertify.success('Complete processing');
          this.uploadService.resetProcessing();
          this.chooseFileMode = true;
          this.uploadService.setChooseFileMode(true);
        }
      );
    }
    (this.signForm.get('arrSongs') as FormArray).clear();
    this.signForm.reset();
  }

}
