import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AlertifyService } from 'src/app/services/alertify.service';
import { takeUntil } from 'rxjs/operators';
import { ArtistsService } from 'src/app/services/artists.service';
import { ValidateService } from 'src/app/services/validate.service';

@Component({
  selector: 'app-popup-edit-artist',
  templateUrl: './popup-edit-artist.component.html',
  styleUrls: ['./popup-edit-artist.component.scss']
})
export class PopupEditArtistComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  arrayType = ['jpg', 'JPG', 'png', 'PNG', 'jpeg', 'JPEG', 'webp', 'WEBP'];

  controlCharacters = /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/;

  destroySubscription$: Subject<boolean> = new Subject();

  disableMode = false;

  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupEditArtistComponent>,
    private artistsService: ArtistsService,
    private alertifyService: AlertifyService,
    private validateService: ValidateService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.signForm.patchValue({
      id: this.data.id,
      name: this.data.name
    });
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  onChange(event) {
    const file = event.target.files[0];
    this.validateService.validateFileBySignature(file, 'image').pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(result => {
      if (result) {
        this.signForm.patchValue({
          avatar: file
        });
      } else {
        this.signForm.patchValue({
          avatar: null
        });
      }
    });
    event.target.value = null;
  }

  initializeForm() {
    this.signForm = new FormGroup({
      id: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      avatar: new FormControl(null, [
        this.validateSelectFile.bind(this),
        this.validateControlCharacters.bind(this),
        this.validateFileNameLength.bind(this),
        this.validateNumberOfExtensions.bind(this)
      ])
    });
  }

  validateSelectFile(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      const lastIndex = control.value.name.lastIndexOf('.');
      const fileType = control.value.name.slice(lastIndex + 1);
      return this.arrayType.includes(fileType) ? null : { invalid: true };
    }
  }

  validateNumberOfExtensions(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return control.value.name.split('.').length === 2 ? null : { numberExtensions: true };
    }
  }

  validateFileNameLength(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return control.value.name.length <= 150 ? null : { fileNameLength: true };
    }
  }

  validateControlCharacters(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      return !this.controlCharacters.test(control.value.name) ? null : { controlCharacters: true };
    }
  }

  onSubmit() {
    this.loading = true;
    this.signForm.disable();
    this.disableMode = true;
    const formData = new FormData();
    formData.append('id', this.signForm.value.id);
    formData.append('name', this.signForm.value.name);
    if (this.signForm.value.avatar) {
      formData.append('file', this.signForm.value.avatar);
    }
    this.artistsService.updateArtist(formData).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(res => {
      this.artistsService.getUpdateArtistAfterEdit().next(res);
      this.alertifyService.success('Update successfully');
      this.signForm.enable();
      this.signForm.reset();
      this.disableMode = false;
      this.dialogRef.close();
      this.loading = false;
    }, err => {
      this.signForm.enable();
      this.disableMode = false;
      this.loading = false;
    });
  }

}
