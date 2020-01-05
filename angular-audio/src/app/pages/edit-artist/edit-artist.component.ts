import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ArtistsService } from 'src/app/services/artists.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-edit-artist',
  templateUrl: './edit-artist.component.html',
  styleUrls: ['./edit-artist.component.scss']
})
export class EditArtistComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  arrayType = ['jpg', 'JPG', 'png', 'PNG', 'gif', 'GIF', 'tif', 'TIF'];

  destroySubscription$: Subject<boolean> = new Subject();

  artists: any[];

  constructor(private artistsService: ArtistsService, private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.loadArtists();
  }

  loadArtists() {
    this.artistsService.getArtists().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((artists: any) => {
      this.artists = artists;
      this.initializeForm();
    }, _ => { });
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

  onEdit(artist) {
    this.signForm.patchValue({
      id: artist.id,
      name: artist.name
    });
  }

  onDelete(artistId, index) {
    this.signForm.reset();
    this.artistsService.deleteArtist({ id: artistId }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(_ => { }, err => console.log(err), () => {
      this.artists = this.artists.filter((v, i) => i !== index);
      this.alertifyService.success('Delete successfully');
    });
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('id', this.signForm.value.id);
    formData.append('name', this.signForm.value.name);
    if (this.signForm.value.avatar) {
      formData.append('file', this.signForm.value.avatar);
    }
    this.artistsService.updateArtist(formData).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(res => {
      const index = this.artists.findIndex(artist => artist.id === res.id);
      this.artists = [...this.artists.filter((v, i) => i < index), { ...res }, ...this.artists.filter((v, i) => i > index)];
      this.alertifyService.success('Update successfully');
    }, err => console.log(err));
    this.signForm.reset();
  }

}
