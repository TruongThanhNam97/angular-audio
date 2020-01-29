import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { CategoryService } from 'src/app/services/categories.service';
import { AuthService } from 'src/app/services/auth.service';
import { CloudService } from 'src/app/services/cloud.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { PopupEditSongComponent } from './popup-edit-song/popup-edit-song.component';
import { AudioService } from 'src/app/services/audio.service';
import { AlbumService } from 'src/app/services/album.service';
import { PopupThreeTypesComponent } from '../player/popup-three-types/popup-three-types.component';
import { ArtistsService } from 'src/app/services/artists.service';
import { ValidateService } from 'src/app/services/validate.service';
import { PopupVideoComponent } from './popup-video/popup-video.component';

@Component({
  selector: 'app-manage-songs',
  templateUrl: './manage-songs.component.html',
  styleUrls: ['./manage-songs.component.scss']
})
export class ManageSongsComponent implements OnInit, OnDestroy {

  signForm: FormGroup;

  categories: any[];
  mySongs: any[];
  artists: any[];

  destroySubscription$: Subject<boolean> = new Subject();

  currentUser: any;

  selectedAlbum: string;
  selectedCategory: string;
  selectedArtist: string;

  currentFile: any = {};

  categoryName: string = null;
  username: string = null;
  artistName: string = null;

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService,
    private cloudService: CloudService,
    private alertifyService: AlertifyService,
    public dialog: MatDialog,
    private audioService: AudioService,
    private album: AlbumService,
    private artistsService: ArtistsService,
    private validateService: ValidateService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAllSongs();
    this.categoryService.getCategories().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(categories => {
      this.categories = categories;
    });
    this.artistsService.getArtists().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(artists => {
      this.artists = artists;
    });
    this.cloudService.getUpdatedSongSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(updatedSong => {
      const index = this.mySongs.findIndex(v => v.id === updatedSong.id);
      this.mySongs = [...this.mySongs.filter((v, i) => i < index), { ...updatedSong }, ...this.mySongs.filter((v, i) => i > index)];
      this.alertifyService.success('Update successfully');
    });
    this.cloudService.getUpdateSongAfterEdit().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(updatedSong => {
      const index = this.mySongs.findIndex(v => v.id === updatedSong.id);
      this.mySongs = [...this.mySongs.filter((v, i) => i < index), { ...updatedSong }, ...this.mySongs.filter((v, i) => i > index)];
    });
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  setUpAudio() {
    this.audioService.triggerDestroyGeneral();

    this.selectedAlbum = this.album.getSelectedAlbum();
    this.selectedCategory = this.categoryService.getSelectedCategory();
    this.selectedArtist = this.artistsService.getSelectedArtist();

    this.currentFile = this.audioService.getCurrentFile();
    this.audioService.getResetCurrentFileSubject()
      .pipe(takeUntil(this.destroySubscription$)).subscribe(currentFile => this.currentFile = currentFile);
    // if (this.audioService.getPlayMode() && ((this.username !== this.selectedAlbum) || (this.categoryName !== this.selectedCategory)
    //   || (this.artistName !== this.selectedArtist))) {
    //   this.currentFile = {};
    // }
    this.audioService.getCurrentFileSubject2().pipe(takeUntil(this.audioService.getDestroyGeneralSubject$())).subscribe((v: any) => {
      this.openFile(v.file, v.index);
    });
  }

  getCategoryNameById(categoryId) {
    if (this.categories) {
      return this.categories.find(category => category.id === categoryId)
        ? this.categories.find(category => category.id === categoryId).name : 'No category';
    }
  }

  getMainArtistNameById(artistId) {
    if (this.artists) {
      return this.artists.find(artist => artist.id === artistId)
        ? this.artists.find(artist => artist.id === artistId).name : 'No artist';
    }
  }

  loadAllSongs() {
    this.cloudService.getAllSongs().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(songs => {
      this.mySongs = songs;
      this.setUpAudio();
      this.cloudService.setCurrentPlayList(this.mySongs);
    });
  }

  onEdit(song: any) {
    this.dialog.open(PopupEditSongComponent, { data: { song, categories: this.categories, artists: this.artists } });
  }

  onDelete(song: any, index: number) {
    this.cloudService.deleteSong({ id: song.id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(() => {
      this.mySongs = this.mySongs.filter((v, i) => i !== index);
      this.alertifyService.success('Delete successfully');
    });
  }

  openFile(file, index) {
    this.cloudService.resetTempAndLastCurrentTime().next(true);
    this.audioService.updatePlayMode();
    if (this.username && this.selectedAlbum === this.username || this.categoryName && this.selectedCategory === this.categoryName
      || this.artistName && this.selectedArtist === this.artistName) {
      this.currentFile = { index, file };
    }
    this.audioService.updateCurrentFile1({ index, file });
    this.audioService.stop();
    this.audioService.playStream(file.url).subscribe();
  }

  update() {
    this.categoryService.resetSelectedCategory();
    this.artistsService.resetSelectedArtist();
    this.album.resetSelectedAlbum();
    this.cloudService.updateCurrentPlayList();
  }

  downloadFile(data) {
    this.dialog.open(PopupThreeTypesComponent, { data });
  }

  isEmpty(data) {
    return this.validateService.isEmpty(data);
  }

  onSeeVideo(data) {
    this.dialog.open(PopupVideoComponent, { data });
  }

}
