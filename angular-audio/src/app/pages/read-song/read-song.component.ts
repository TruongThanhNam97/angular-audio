import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ValidateService } from 'src/app/services/validate.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  selector: 'app-read-song',
  templateUrl: './read-song.component.html',
  styleUrls: ['./read-song.component.scss']
})
export class ReadSongComponent implements OnInit, OnDestroy {

  signForm: FormGroup;
  destroySubscription$: Subject<boolean> = new Subject();
  typeFileMusic = ['mp3', 'MP3', 'wav', 'WAV', 'm4a', 'M4A', 'flac', 'FLAC'];
  controlCharacters = /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/;
  loading = false;

  constructor(
    private validateService: ValidateService,
    private uploadService: UploadService) { }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  initializeForm() {
    this.signForm = new FormGroup({
      file: new FormControl(null,
        [
          Validators.required,
          this.validateFileNameLength.bind(this),
          this.validateNumberOfExtensions.bind(this),
          this.validateControlCharacters.bind(this),
          this.validateFile.bind(this),
          this.validateFileSize.bind(this)
        ]
      )
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

  onSelectFile(e) {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      this.validateService.validateFileBySignature(file, 'audio').pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(result => {
        if (result) {
          this.signForm.patchValue({
            file
          });
        } else {
          this.signForm.patchValue({
            file: null
          });
        }
      });
    }
    e.target.value = null;
  }

  submit() {
    this.loading = true;
    const formData = new FormData();
    formData.append('file', this.signForm.get('file').value);
    this.uploadService.readSong(formData).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(res => {
      console.log(res);
    }, err => {
      console.log(err);
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

}
