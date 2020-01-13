import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ArtistsService } from 'src/app/services/artists.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-upload-artist',
  templateUrl: './upload-artist.component.html',
  styleUrls: ['./upload-artist.component.scss']
})
export class UploadArtistComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  arrayType = ['jpg', 'JPG', 'png', 'PNG', 'gif', 'GIF', 'tif', 'TIF'];

  destroySubscription$: Subject<boolean> = new Subject();

  constructor(private artistsService: ArtistsService, private alertify: AlertifyService) { }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  initializeForm() {
    this.signForm = new FormGroup({
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

  onChange(e) {
    this.signForm.patchValue({
      avatar: e.target.files[0]
    });
    e.target.value = null;
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('name', this.signForm.value.name);
    formData.append('avatar', this.signForm.value.avatar);
    this.artistsService.upload(formData).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(
      _ => this.alertify.success('Upload successfully'),
      err => {
        if (err.error.name) {
          this.alertify.error(err.error.name);
        }
      },
      () => this.signForm.reset()
    );
  }

}
