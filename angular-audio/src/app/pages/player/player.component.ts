import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { CloudService } from '../../services/cloud.service';
import { StreamState } from '../../interfaces/stream-state';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material';
import { PopupComponent } from './popup/popup.component';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from 'src/app/services/album.service';
import { CategoryService } from 'src/app/services/categories.service';
import { ArtistsService } from 'src/app/services/artists.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { PlayListService } from 'src/app/services/playlist.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {
  files: any[];
  state: StreamState;
  currentFile: any = {};
  currentUser: any;
  destroySubscription$: Subject<boolean> = new Subject();
  loading = false;
  id: string;
  categoryName: string = null;
  username: string = null;
  artistName: string = null;
  favoriteMode: string = null;
  playlist: string = null;
  displayButtonBack: string = null;
  selectedAlbum: string;
  selectedCategory: string;
  selectedArtist: string;
  selectedFavoriteMode: string;
  selectedPlayList: string;

  isMatchCurrentPlayListAndCurrentPlayerAudio: boolean;

  constructor(
    private audioService: AudioService,
    private cloudService: CloudService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private album: AlbumService,
    private router: Router,
    private categoryService: CategoryService,
    private artistsService: ArtistsService,
    private authService: AuthService,
    private alertify: AlertifyService,
    private playListService: PlayListService
  ) { }

  ngOnInit() {
    this.isMatchCurrentPlayListAndCurrentPlayerAudio = false;
    this.currentUser = this.authService.getCurrentUser();
    this.audioService.triggerDestroyGeneral();
    this.selectedAlbum = this.album.getSelectedAlbum();
    this.selectedCategory = this.categoryService.getSelectedCategory();
    this.selectedArtist = this.artistsService.getSelectedArtist();
    this.selectedFavoriteMode = this.cloudService.getSelectedFavoriteSongs();
    this.selectedPlayList = this.playListService.getSelectedPlayList();
    this.route.params.subscribe(param => this.id = param.id);
    this.route.queryParams.subscribe(param => {
      if (param.displayButtonBack) {
        this.displayButtonBack = param.displayButtonBack;
      }
      if (param.username && param.favoriteMode) {
        this.username = param.username;
        this.favoriteMode = param.favoriteMode;
        this.loadSongsByUserId(this.id);
      }
      if (param.username && !param.favoriteMode) {
        this.username = param.username;
        this.loadSongsByUserId(this.id);
      }
      if (param.categoryName) {
        this.categoryName = param.categoryName;
        this.loadSongsByCategoryId(this.id);
      }
      if (param.artistName) {
        this.artistName = param.artistName;
        this.loadSongsByArtistId(this.id);
      }
      if (param.playlist) {
        this.playlist = param.playlist;
        this.loadSongsByPlayList();
      }
    });
    this.currentFile = this.audioService.getCurrentFile();
    this.audioService.getResetCurrentFileSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(currentFile => this.currentFile = currentFile);
    if (this.audioService.getPlayMode() && ((this.username !== this.selectedAlbum) || (this.categoryName !== this.selectedCategory)
      || (this.artistName !== this.selectedArtist) || (this.favoriteMode !== this.selectedFavoriteMode)
      || (this.playlist !== this.selectedPlayList))) {
      this.currentFile = {};
    } else {
      this.isMatchCurrentPlayListAndCurrentPlayerAudio = true;
    }
    this.audioService.getCurrentFileSubject2().pipe(takeUntil(this.audioService.getDestroyGeneralSubject$())).subscribe((v: any) => {
      this.openFile(v.file, v.index);
    });
    this.cloudService.getCurrentFileSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(currentFile => {
      if (this.isMatchCurrentPlayListAndCurrentPlayerAudio) {
        this.currentFile = { ...currentFile };
      }
    });
    this.cloudService.getUpdatedSongsAfterLikingSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(files => {
      if (this.isMatchCurrentPlayListAndCurrentPlayerAudio) {
        this.files = [...files];
      }
    });
    this.cloudService.getBlockedSongsAfterBlockSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(blockedSong => {
      this.files = this.files.filter(song => song.id !== blockedSong.id);
      this.cloudService.setCurrentPlayList(this.files);
    });
    this.playListService.getListSongsAfterDeleteFromPlayListSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(data => {
      this.files = this.files.filter(song => song.id !== data.songId);
      this.cloudService.setCurrentPlayList(this.files);
    });
  }

  isLiked(song: any): boolean {
    return song.likedUsers.filter(like => like.user === this.currentUser.id).length > 0;
  }

  onLikeSong(song: any) {
    return this.cloudService.likeSong({ id: song.id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      const index = this.files.findIndex(item => item.id === song.id);
      this.files = [...this.files.filter((v, i) => i < index), { ...song }, ...this.files.filter((v, i) => i > index)];
      if (this.playlist) {
        this.files = this.files.map(song => {
          song.playlistId = this.id;
          song.playlistName = this.playlist;
          return song;
        });
      }
      if (this.isMatchCurrentPlayListAndCurrentPlayerAudio) {
        this.cloudService.getUpdatedSongsAfterLikingSubject().next(this.files);
      }
      if (!this.audioService.getPlayMode()) {
        this.cloudService.setCurrentPlayList(this.files);
      }
    }, err => console.log(err));
  }

  loadSongsByUserId(id: string): void {
    this.loading = true;
    if (!this.favoriteMode) {
      this.cloudService.getSongsByUserId(id).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(files => {
        this.files = files;
      }, err => { }, () => this.loading = false);
    } else {
      this.cloudService.getFavoriteSongsByUserId(id).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(files => {
        this.files = files;
      }, err => { }, () => this.loading = false);
    }
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

  loadSongsByPlayList() {
    this.files = [...this.playListService.getListSongsOfPlayList()];
    this.cloudService.setCurrentPlayList(this.files);
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  openFile(file, index) {
    this.audioService.updatePlayMode();
    if (this.username && this.selectedAlbum === this.username || this.categoryName && this.selectedCategory === this.categoryName
      || this.artistName && this.selectedArtist === this.artistName || this.playlist && this.selectedPlayList === this.playlist) {
      this.currentFile = { index, file };
    }
    this.audioService.updateCurrentFile1({ index, file });
    this.audioService.stop();
    this.audioService.playStream(file.url).subscribe();
    this.isMatchCurrentPlayListAndCurrentPlayerAudio = true;
    // this.cloudService.getUpdatedSongsAfterLikingSubject().next(this.files);
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
      this.cloudService.resetSelectedFavoriteSongs();
      this.playListService.resetSelectedPlayList();
      this.album.setSelectedAlbum(this.username);
      this.selectedAlbum = this.username;
    }
    if (this.categoryName) {
      this.album.resetSelectedAlbum();
      this.artistsService.resetSelectedArtist();
      this.cloudService.resetSelectedFavoriteSongs();
      this.playListService.resetSelectedPlayList();
      this.categoryService.setSelectedCategory(this.categoryName);
      this.selectedCategory = this.categoryName;
    }
    if (this.artistName) {
      this.album.resetSelectedAlbum();
      this.categoryService.resetSelectedCategory();
      this.cloudService.resetSelectedFavoriteSongs();
      this.playListService.resetSelectedPlayList();
      this.artistsService.setSelectedArtist(this.artistName);
      this.selectedArtist = this.artistName;
    }
    if (this.favoriteMode) {
      this.categoryService.resetSelectedCategory();
      this.artistsService.resetSelectedArtist();
      this.playListService.resetSelectedPlayList();
      this.cloudService.setSelectedFavoriteSongs(this.favoriteMode);
      this.selectedFavoriteMode = this.favoriteMode;
    }
    if (this.playlist) {
      this.album.resetSelectedAlbum();
      this.categoryService.resetSelectedCategory();
      this.artistsService.resetSelectedArtist();
      this.cloudService.resetSelectedFavoriteSongs();
      this.playListService.setSelectedPlayList(this.playlist);
      this.selectedPlayList = this.playlist;
    }
    this.cloudService.updateCurrentPlayList();
  }
}
