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
import { Subject } from 'rxjs';
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

  typeFileMusic = ['mp3', 'MP3', 'wav', 'WAV'];

  categories: any;

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
    this.categoryService.getCategories().pipe(
      take(1)
    ).subscribe(categories => {
      this.categories = categories;
      this.initializeForm();
    });
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
          file: new FormControl(file, [this.validateFile.bind(this)]),
          categoryId: new FormControl(this.categories[0].id)
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

  initializeForm() {
    this.signForm = new FormGroup({
      arrSongs: new FormArray([])
    });
  }

  getControls() {
    return (this.signForm.get('arrSongs') as FormArray).controls;
  }

  onSave(control: FormControl, index: number) {
    this.uploadService.addQueueProcessing();
    const formData = new FormData();
    formData.append('name', control.value.name);
    formData.append('artist', control.value.artist);
    formData.append('file', control.value.file);
    formData.append('categoryId', control.value.categoryId);
    this.alertify.success('Waiting processing');
    this.uploadService.uploadSong(formData).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(
      (res: any) => {
        const songName = res.song.name;
        this.alertify.success(`Song name: ${songName} has been processed`);
        this.uploadService.minusQueueProcessing();
      },
      err => {
        this.uploadService.minusQueueProcessing();
        localStorage.setItem('reup', err.error.error.numberOfReup);
        this.authService.updateReupDectected(err.error.error.numberOfReup);
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
