import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { CloudService } from '../../services/cloud.service';
import { StreamState } from '../../interfaces/stream-state';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material';
import { PopupComponent } from './popup/popup.component';
import { takeUntil, take } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from 'src/app/services/album.service';
import { CategoryService } from 'src/app/services/categories.service';
import { ArtistsService } from 'src/app/services/artists.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {
  files: any;
  state: StreamState;
  currentFile: any = {};
  destroySubscription$: Subject<boolean> = new Subject();
  loading = false;
  id: string;
  categoryName: string = null;
  username: string = null;
  artistName: string = null;
  selectedAlbum: string;
  selectedCategory: string;
  selectedArtist: string;

  constructor(
    private audioService: AudioService,
    private cloudService: CloudService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private album: AlbumService,
    private router: Router,
    private categoryService: CategoryService,
    private artistsService: ArtistsService
  ) { }

  ngOnInit() {
    this.audioService.triggerDestroyGeneral();
    this.selectedAlbum = this.album.getSelectedAlbum();
    this.selectedCategory = this.categoryService.getSelectedCategory();
    this.selectedArtist = this.artistsService.getSelectedArtist();
    this.route.params.subscribe(param => this.id = param.id);
    this.route.queryParams.subscribe(param => {
      if (param.username) {
        this.username = param.username;
        this.loadSongsByUserId(this.id);
        // if (!this.selectedAlbum && !this.selectedCategory && !this.selectedArtist) {
        //   this.album.setSelectedAlbum(this.username);
        // }
      }
      if (param.categoryName) {
        this.categoryName = param.categoryName;
        this.loadSongsByCategoryId(this.id);
        // if (!this.selectedAlbum && !this.selectedCategory && !this.selectedArtist) {
        //   this.categoryService.setSelectedCategory(this.categoryName);
        // }
      }
      if (param.artistName) {
        this.artistName = param.artistName;
        this.loadSongsByArtistId(this.id);
        // if (!this.selectedAlbum && !this.selectedCategory && !this.selectedArtist) {
        //   this.artistsService.setSelectedArtist(this.artistName);
        // }
      }
    });
    this.currentFile = this.audioService.getCurrentFile();
    if (this.audioService.getPlayMode() && ((this.username !== this.selectedAlbum) || (this.categoryName !== this.selectedCategory)
      || (this.artistName !== this.selectedArtist))) {
      this.currentFile = {};
    }
    this.audioService.getCurrentFileSubject2().pipe(takeUntil(this.audioService.getDestroyGeneralSubject$())).subscribe((v: any) => {
      this.openFile(v.file, v.index);
    });
  }

  loadSongsByUserId(id: string): void {
    this.loading = true;
    this.cloudService.getSongsByUserId(id).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(files => {
      this.files = files;
    }, err => { }, () => this.loading = false);
  }

  loadSongsByCategoryId(id: string): void {
    this.loading = true;
    this.cloudService.getSongsByCategoryId(id).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(files => {
      this.files = files;
    }, err => { }, () => this.loading = false);
  }

  loadSongsByArtistId(id: string): void {
    this.loading = true;
    this.cloudService.getSongsByArtistId(id).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(files => {
      this.files = files;
    }, err => { }, () => this.loading = false);
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  openFile(file, index) {
    this.audioService.updatePlayMode();
    if (this.username && this.selectedAlbum === this.username || this.categoryName && this.selectedCategory === this.categoryName
      || this.artistName && this.selectedArtist === this.artistName) {
      this.currentFile = { index, file };
    }
    this.audioService.updateCurrentFile1({ index, file });
    this.audioService.stop();
    this.audioService.playStream(file.url).subscribe();
  }

  openDialog(file: any): void {
    this.dialog.open(PopupComponent, { data: file });
  }

  onBack() {
    if (this.username) {
      this.router.navigate(['/albums']);
    }
    if (this.categoryName) {
      this.router.navigate(['/categories']);
    }
    if (this.artistName) {
      this.router.navigate(['/artists']);
    }
  }

  update() {
    if (this.username) {
      this.categoryService.resetSelectedCategory();
      this.artistsService.resetSelectedArtist();
      this.album.setSelectedAlbum(this.username);
      this.selectedAlbum = this.username;
    }
    if (this.categoryName) {
      this.album.resetSelectedAlbum();
      this.artistsService.resetSelectedArtist();
      this.categoryService.setSelectedCategory(this.categoryName);
      this.selectedCategory = this.categoryName;
    }
    if (this.artistName) {
      this.album.resetSelectedAlbum();
      this.categoryService.resetSelectedCategory();
      this.artistsService.setSelectedArtist(this.artistName);
      this.selectedArtist = this.artistName;
    }
    this.cloudService.updateCurrentPlayList();
  }
}
