import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ArtistsService } from 'src/app/services/artists.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { PopupEditArtistComponent } from './popup-edit-artist/popup-edit-artist.component';

@Component({
  selector: 'app-edit-artist',
  templateUrl: './edit-artist.component.html',
  styleUrls: ['./edit-artist.component.scss']
})
export class EditArtistComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();

  artists: any[];

  artistName: string;

  loading = false;
  loadingDelete = false;

  constructor(
    private artistsService: ArtistsService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.loadArtists();
    this.artistsService.getUpdateArtistAfterEdit().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(res => {
      const index = this.artists.findIndex(artist => artist.id === res.id);
      this.artists = [...this.artists.filter((v, i) => i < index), { ...res }, ...this.artists.filter((v, i) => i > index)];
    });
  }

  loadArtists() {
    this.loading = true;
    this.artistsService.getArtists().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((artists: any) => {
      this.artists = artists;
      this.loading = false;
    }, _ => this.loading = false);
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  onEdit(artist) {
    this.dialog.open(PopupEditArtistComponent, { data: artist });
  }

  onDelete(artistId, index) {
    if (!this.loadingDelete) {
      this.loadingDelete = true;
      this.artistsService.deleteArtist({ id: artistId }).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(_ => { }, err => this.loadingDelete = false, () => {
        this.artists = this.artists.filter((v, i) => i !== index);
        this.alertifyService.success('Delete successfully');
        this.loadingDelete = false;
      });
    }
  }

}
