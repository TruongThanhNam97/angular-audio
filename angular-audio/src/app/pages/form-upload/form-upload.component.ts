import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertifyService } from 'src/app/services/alertify.service';
import { environment } from 'src/environments/environment';
import { DECODE_TOKEN } from 'src/app/interfaces/decode-token';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material';
import { PopupBanComponent } from '../login/popup-ban/popup-ban.component';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { UploadService } from 'src/app/services/upload.service';
import { takeUntil, map, catchError, switchMap, tap, take, delay } from 'rxjs/operators';
import { Subject, concat, fromEvent, Observable, of, merge } from 'rxjs';
import { CategoryService } from 'src/app/services/categories.service';
import { ValidateService } from 'src/app/services/validate.service';

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

  controlCharacters = /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/;

  categories: any;

  chooseFileMode: boolean;

  constructor(
    private alertify: AlertifyService,
    private authService: AuthService,
    public dialog: MatDialog,
    private uploadService: UploadService,
    private categoryService: CategoryService,
    private validateService: ValidateService
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
        let formGroup;
        this.validateService.validateFileBySignature(file, 'audio').pipe(
          takeUntil(this.destroySubscription$)
        ).subscribe(result => {
          if (result) {
            formGroup = new FormGroup({
              name: new FormControl(song.split('-')[0], [Validators.required, Validators.maxLength(50)]),
              artist: new FormControl(song.split('-')[1], [Validators.required, Validators.maxLength(50)]),
              file: new FormControl(file,
                [
                  Validators.required,
                  this.validateFileNameLength.bind(this),
                  this.validateNumberOfExtensions.bind(this),
                  this.validateControlCharacters.bind(this),
                  this.validateFile.bind(this),
                  this.validateFileSize.bind(this)
                ]
              ),
              detail: new FormControl('')
            });
          } else {
            formGroup = new FormGroup({
              name: new FormControl(song.split('-')[0], [Validators.required, Validators.maxLength(50)]),
              artist: new FormControl(song.split('-')[1], [Validators.required, Validators.maxLength(50)]),
              file: new FormControl(null,
                [
                  Validators.required,
                  this.validateFileNameLength.bind(this),
                  this.validateNumberOfExtensions.bind(this),
                  this.validateControlCharacters.bind(this),
                  this.validateFile.bind(this),
                  this.validateFileSize.bind(this)
                ]
              ),
              detail: new FormControl('')
            });
          }
          (this.signForm.get('arrSongs') as FormArray).push(formGroup);
        });
      }
    }
    e.target.value = null;
  }

  renameFile(name: string, index: number) {
    const oldFileItem = (this.signForm.get('arrSongs') as FormArray).controls[index].value.file;
    const extension = oldFileItem.name.split('.')[oldFileItem.name.split('.').length - 1];
    const newFile: File = new File([oldFileItem], `${name}.${extension}`, { type: oldFileItem.type });
    const lastIndex = newFile.name.lastIndexOf('.');
    const songName = newFile.name.slice(0, lastIndex);
    (this.signForm.get('arrSongs') as FormArray).controls[index].patchValue({
      file: newFile,
      name: songName.split('-')[0],
      artist: songName.split('-')[1]
    });
  }

  validateFileNameLength(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return control.value.name.length <= 150 ? null : { fileNameLength: true };
    }
  }

  validateNumberOfExtensions(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return control.value.name.split('.').length === 2 ? null : { numberExtensions: true };
    }
  }

  validateControlCharacters(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return !this.controlCharacters.test(control.value.name) ? null : { controlCharacters: true };
    }
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
      return +fileSize <= 60 && +fileSize >= 0.5 ? null : { invalidSize: true };
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

  completeProcessing() {
    this.alertify.success('Complete processing');
    this.uploadService.resetProcessing();
    this.chooseFileMode = true;
    this.uploadService.setChooseFileMode(true);
  }

  saveAll() {
    const arrOb$ = [];
    let arrNameArtist = [];
    let arrSongContent = [];
    const arrSongs = (this.signForm.get('arrSongs') as FormArray).value;
    this.uploadService.setAllQueueProcessing(arrSongs.length);
    if (arrSongs.length <= 5) {
      const formData = new FormData();
      arrSongs.forEach(song => {
        arrNameArtist.push({ name: song.name, artist: song.artist });
        arrSongContent.push(song.detail.trim());
        formData.append('file', song.file);
      });
      formData.append('arrNameArtist', JSON.stringify(arrNameArtist));
      formData.append('arrSongContent', JSON.stringify(arrSongContent));
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
          this.completeProcessing();
        },
        () => {
          this.completeProcessing();
        }
      );
    } else {
      let formData = new FormData();
      let count = 0;
      arrSongs.forEach((song, index, arr) => {
        count++;
        if (count === 5 || index === arr.length - 1) {
          arrNameArtist.push({ name: song.name, artist: song.artist });
          arrSongContent.push(song.detail.trim());
          formData.append('arrNameArtist', JSON.stringify(arrNameArtist));
          formData.append('arrSongContent', JSON.stringify(arrSongContent));
          formData.append('file', song.file);
          arrOb$.push(this.uploadService.uploadSong(formData));
          count = 0;
          formData = new FormData();
          arrNameArtist = [];
          arrSongContent = [];
        } else {
          arrNameArtist.push({ name: song.name, artist: song.artist });
          arrSongContent.push(song.detail.trim());
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
          this.completeProcessing();
        },
        () => {
          this.completeProcessing();
        }
      );
    }
    (this.signForm.get('arrSongs') as FormArray).clear();
    this.signForm.reset();
  }

}
