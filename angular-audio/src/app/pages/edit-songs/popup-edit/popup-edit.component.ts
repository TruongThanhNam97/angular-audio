import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subject, Observable, fromEvent } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CloudService } from 'src/app/services/cloud.service';
import { takeUntil, map } from 'rxjs/operators';
import { AlertifyService } from 'src/app/services/alertify.service';
import { ValidateService } from 'src/app/services/validate.service';

@Component({
  selector: 'app-popup-edit',
  templateUrl: './popup-edit.component.html',
  styleUrls: ['./popup-edit.component.scss']
})
export class PopupEditComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();

  typeVideoMusic = ['mp4', 'MP4'];

  signForm: FormGroup;

  modeDisable = false;

  loading = false;

  controlCharacters = /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupEditComponent>,
    private cloudService: CloudService,
    private alertifyService: AlertifyService,
    private validateService: ValidateService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.signForm.patchValue({
      id: this.data.id,
      name: this.data.name,
      artist: this.data.artist,
      detail: this.data.songcontent.detail.trim()
    });
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  initializeForm() {
    this.signForm = new FormGroup({
      id: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      artist: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      detail: new FormControl(''),
      video: new FormControl(null,
        [
          this.validateVideo.bind(this),
          this.validateVideoSize.bind(this),
          this.validateFileNameLength.bind(this),
          this.validateNumberOfExtensions.bind(this),
          this.validateControlCharacters.bind(this)
        ])
    });
  }

  onSelectVideo(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.validateService.validateFileBySignature(file, 'video').pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(result => {
        if (result) {
          this.signForm.patchValue({
            video: file
          });
        } else {
          this.signForm.patchValue({
            video: null
          });
        }
      });
    }
    event.target.value = null;
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

  validateVideo(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      const lastIndex = control.value.name.lastIndexOf('.');
      const typeFile = control.value.name.slice(lastIndex + 1);
      return this.typeVideoMusic.includes(typeFile) ? null : { invalid: true };
    }
  }

  validateVideoSize(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      const fileSize = (control.value.size / 1000000).toFixed(1);
      return +fileSize <= 150 && +fileSize >= 10 ? null : { invalidSize: true };
    }
  }

  // const { id, name, artist, categoryId, artistId, detail } = req.body;

  onSubmit() {
    const formData = new FormData();
    formData.append('id', this.signForm.value.id);
    formData.append('name', this.signForm.value.name);
    formData.append('artist', this.signForm.value.artist);
    formData.append('detail', this.signForm.value.detail.trim());
    formData.append('video', this.signForm.value.video);
    this.signForm.disable();
    this.modeDisable = true;
    this.loading = true;
    this.cloudService.updateSong(formData).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      this.cloudService.getUpdateSongAfterEdit().next(song);
      this.alertifyService.success('Update successfully');
      this.signForm.reset();
      this.dialogRef.close();
      this.modeDisable = false;
      this.loading = false;
    }, err => {
      this.modeDisable = false;
      this.loading = false;
    });
  }

}
