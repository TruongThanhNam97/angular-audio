import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AlertifyService } from 'src/app/services/alertify.service';
import { takeUntil } from 'rxjs/operators';
import { ArtistsService } from 'src/app/services/artists.service';

@Component({
  selector: 'app-popup-edit-artist',
  templateUrl: './popup-edit-artist.component.html',
  styleUrls: ['./popup-edit-artist.component.scss']
})
export class PopupEditArtistComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  arrayType = ['jpg', 'JPG', 'png', 'PNG', 'gif', 'GIF', 'tif', 'TIF'];

  destroySubscription$: Subject<boolean> = new Subject();

  disableMode = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupEditArtistComponent>,
    private artistsService: ArtistsService,
    private alertifyService: AlertifyService
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

  onChange(e) {
    this.signForm.patchValue({
      avatar: e.target.files[0]
    });
    e.target.value = null;
  }

  initializeForm() {
    this.signForm = new FormGroup({
      id: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      avatar: new FormControl(null, [this.validateSelectFile.bind(this)])
    });
  }

  validateSelectFile(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      const lastIndex = control.value.name.lastIndexOf('.');
      const fileType = control.value.name.slice(lastIndex + 1);
      return this.arrayType.includes(fileType) ? null : { invalid: true };
    }
  }

  onSubmit() {
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
    }, err => {
      console.log(err);
      this.signForm.enable();
      this.disableMode = false;
    });
  }

}
