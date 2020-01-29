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
import { SongInfoService } from 'src/app/services/song-info.service';
import { SocketIoService } from 'src/app/services/socket-io.service';
import { ValidateService } from 'src/app/services/validate.service';
import { PopupVideoComponent } from '../manage-songs/popup-video/popup-video.component';

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
  top100Love: string = null;
  top100Hear: string = null;

  displayButtonBack: string = null;

  selectedAlbum: string;
  selectedCategory: string;
  selectedArtist: string;
  selectedFavoriteMode: string;
  selectedPlayList: string;
  selectedTop100Love: string;
  selectedTop100Hear: string;

  arrSongContent = [];

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
    private playListService: PlayListService,
    private songInfoService: SongInfoService,
    private socketIo: SocketIoService,
    private validateService: ValidateService
  ) { }

  ngOnInit() {
    this.currentFile = this.audioService.getCurrentFile();
    if (!this.isEmpty()) {
      this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
    }
    this.isMatchCurrentPlayListAndCurrentPlayerAudio = false;
    this.currentUser = this.authService.getCurrentUser();
    this.audioService.triggerDestroyGeneral();
    this.selectedAlbum = this.album.getSelectedAlbum();
    this.selectedCategory = this.categoryService.getSelectedCategory();
    this.selectedArtist = this.artistsService.getSelectedArtist();
    this.selectedFavoriteMode = this.cloudService.getSelectedFavoriteSongs();
    this.selectedTop100Love = this.cloudService.getSelectedTop100Love();
    this.selectedTop100Hear = this.cloudService.getSelectedTop100Hear();
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
      if (param.top100Love) {
        this.top100Love = param.top100Love;
        this.loadTop100Love();
      }
      if (param.top100Hear) {
        this.top100Hear = param.top100Hear;
        this.loadTop100Hear();
      }
    });
    this.audioService.getResetCurrentFileSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(currentFile => this.currentFile = currentFile);
    if (this.audioService.getPlayMode() && ((this.username !== this.selectedAlbum) || (this.categoryName !== this.selectedCategory)
      || (this.artistName !== this.selectedArtist) || (this.favoriteMode !== this.selectedFavoriteMode)
      || (this.playlist !== this.selectedPlayList)
      || (this.top100Love !== this.selectedTop100Love)
      || (this.top100Hear !== this.selectedTop100Hear))) {
      this.currentFile = {};
      this.arrSongContent = [];
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
        this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
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
    this.cloudService.getUpdateSongAfterManipulatingSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(updatedSong => {
      if (this.files.filter(song => song.id === updatedSong.id).length > 0) {
        const index = this.files.findIndex(song => song.id === updatedSong.id);
        this.files = [...this.files.filter((v, i) => i < index), { ...updatedSong }, ...this.files.filter((v, i) => i > index)];
      }
    });
    this.socketIo.getCommentsRealTime().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((updatedSong: any) => {
      if (this.files.filter(song => song.id === updatedSong.id).length > 0) {
        const index = this.files.findIndex(song => song.id === updatedSong.id);
        this.files = [...this.files.filter((v, i) => i < index), { ...updatedSong }, ...this.files.filter((v, i) => i > index)];
      }
      if (this.currentFile.file && this.currentFile.file.id === updatedSong.id) {
        this.currentFile = { ...this.currentFile, file: updatedSong };
      }
    });
    this.socketIo.getLikeSongRealTime().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((updatedSong: any) => {
      if (this.files.filter(song => song.id === updatedSong.id).length > 0) {
        const index = this.files.findIndex(song => song.id === updatedSong.id);
        this.files = [...this.files.filter((v, i) => i < index), { ...updatedSong }, ...this.files.filter((v, i) => i > index)];
      }
      if (this.currentFile.file && this.currentFile.file.id === updatedSong.id) {
        this.currentFile = { ...this.currentFile, file: updatedSong };
      }
    });
    this.socketIo.getViewsRealTime().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((updatedSong: any) => {
      if (this.files.filter(song => song.id === updatedSong.id).length > 0) {
        const index = this.files.findIndex(song => song.id === updatedSong.id);
        this.files = [...this.files.filter((v, i) => i < index), { ...updatedSong }, ...this.files.filter((v, i) => i > index)];
      }
      if (this.currentFile.file && this.currentFile.file.id === updatedSong.id) {
        this.currentFile = { ...this.currentFile, file: updatedSong };
      }
    });
  }

  isLiked(song: any): boolean {
    if (this.currentUser) {
      return song.likedUsers.filter(like => like.user === this.currentUser.id).length > 0;
    }
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
        this.cloudService.getUpdateSongAfterManipulatingSubject().next({ ...song, playlistId: this.id, playlistName: this.playlist });
      } else {
        this.cloudService.getUpdateSongAfterManipulatingSubject().next(song);
      }
      if (this.isMatchCurrentPlayListAndCurrentPlayerAudio) {
        this.cloudService.getUpdatedSongsAfterLikingSubject().next(this.files);
      }
      if (!this.audioService.getPlayMode()) {
        this.cloudService.setCurrentPlayList(this.files);
      }
      if (this.isLiked(song)) {
        this.alertify.success('Like successfully');
      } else {
        this.alertify.success('UnLike successfully');
      }
      // this.cloudService.getUpdateSongAfterManipulatingSubject().next(song);
      // this.socketIo.likeSongRealTime();
    }, err => console.log(err));
  }

  loadSongsByUserId(id: string): void {
    this.loading = true;
    if (!this.favoriteMode) {
      this.cloudService.getSongsByUserId(id).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(files => {
        this.files = files;
        if (this.currentFile.index >= 0) {
          const newIndex = this.files.findIndex(song => song.id === this.currentFile.file.id);
          if (newIndex !== this.currentFile.index) {
            this.currentFile = { index: newIndex, file: this.currentFile.file };
            this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
          }
        }
      }, err => { }, () => this.loading = false);
    } else {
      this.cloudService.getFavoriteSongsByUserId(id).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(files => {
        this.files = files;
        if (this.currentFile.index >= 0) {
          const newIndex = this.files.findIndex(song => song.id === this.currentFile.file.id);
          if (newIndex !== this.currentFile.index) {
            this.currentFile = { index: newIndex, file: this.currentFile.file };
            this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
          }
        }
      }, err => { }, () => this.loading = false);
    }
  }

  loadSongsByCategoryId(id: string): void {
    this.loading = true;
    this.cloudService.getSongsByCategoryId(id).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(files => {
      this.files = files;
      if (this.currentFile.index >= 0) {
        const newIndex = this.files.findIndex(song => song.id === this.currentFile.file.id);
        if (newIndex !== this.currentFile.index) {
          this.currentFile = { index: newIndex, file: this.currentFile.file };
          this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
        }
      }
    }, err => { }, () => this.loading = false);
  }

  loadSongsByArtistId(id: string): void {
    this.loading = true;
    this.cloudService.getSongsByArtistId(id).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(files => {
      this.files = files;
      if (this.currentFile.index >= 0) {
        const newIndex = this.files.findIndex(song => song.id === this.currentFile.file.id);
        if (newIndex !== this.currentFile.index) {
          this.currentFile = { index: newIndex, file: this.currentFile.file };
          this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
        }
      }
    }, err => { }, () => this.loading = false);
  }

  loadSongsByPlayList() {
    this.files = [...this.playListService.getListSongsOfPlayList()];
    if (this.currentFile.index >= 0) {
      const newIndex = this.files.findIndex(song => song.id === this.currentFile.file.id);
      if (newIndex !== this.currentFile.index) {
        this.currentFile = { index: newIndex, file: this.currentFile.file };
        this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
      }
    }
    this.cloudService.setCurrentPlayList(this.files);
  }

  loadTop100Love() {
    this.loading = true;
    this.cloudService.getTop100FavoriteSongs().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(files => {
      this.files = files;
      if (this.currentFile.index >= 0) {
        const newIndex = this.files.findIndex(song => song.id === this.currentFile.file.id);
        if (newIndex !== this.currentFile.index) {
          this.currentFile = { index: newIndex, file: this.currentFile.file };
          this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
        }
      }
    }, err => { }, () => this.loading = false);
  }

  loadTop100Hear() {
    this.loading = true;
    this.cloudService.getTop100Hear().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(files => {
      this.files = files;
      if (this.currentFile.index >= 0) {
        const newIndex = this.files.findIndex(song => song.id === this.currentFile.file.id);
        if (newIndex !== this.currentFile.index) {
          this.currentFile = { index: newIndex, file: this.currentFile.file };
          this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
        }
      }
    }, err => { }, () => this.loading = false);
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  openFile(file, index) {
    this.cloudService.resetTempAndLastCurrentTime().next(true);
    this.audioService.updatePlayMode();
    if (this.username && this.selectedAlbum === this.username || this.categoryName && this.selectedCategory === this.categoryName
      || this.artistName && this.selectedArtist === this.artistName || this.playlist && this.selectedPlayList === this.playlist
      || this.top100Love && this.selectedTop100Love === this.top100Love
      || this.top100Hear && this.selectedTop100Hear === this.top100Hear
    ) {
      this.currentFile = { index, file };
      this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
    }
    this.audioService.updateCurrentFile1({ index, file });
    this.audioService.stop();
    this.audioService.playStream(file.url).subscribe();
    this.isMatchCurrentPlayListAndCurrentPlayerAudio = true;
    this.cloudService.setSelectedSongId(file.id);
    // this.songInfoService.getModeSubject().next('displayBtnPlay');
    // this.cloudService.getUpdatedSongsAfterLikingSubject().next(this.files);
  }

  openDialog(file: any): void {
    file.temp = 'fromPlayer';
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
    if (this.top100Love || this.top100Hear) {
      this.router.navigate(['/top100']);
    }
  }

  update(file) {
    if (this.username) {
      this.categoryService.resetSelectedCategory();
      this.artistsService.resetSelectedArtist();
      this.cloudService.resetSelectedFavoriteSongs();
      this.playListService.resetSelectedPlayList();
      this.cloudService.resetSelectedTop100Love();
      this.cloudService.resetSelectedTop100Hear();
      this.album.setSelectedAlbum(this.username);
      this.selectedAlbum = this.username;
    }
    if (this.categoryName) {
      this.album.resetSelectedAlbum();
      this.artistsService.resetSelectedArtist();
      this.cloudService.resetSelectedFavoriteSongs();
      this.playListService.resetSelectedPlayList();
      this.cloudService.resetSelectedTop100Love();
      this.cloudService.resetSelectedTop100Hear();
      this.categoryService.setSelectedCategory(this.categoryName);
      this.selectedCategory = this.categoryName;
    }
    if (this.artistName) {
      this.album.resetSelectedAlbum();
      this.categoryService.resetSelectedCategory();
      this.cloudService.resetSelectedFavoriteSongs();
      this.playListService.resetSelectedPlayList();
      this.cloudService.resetSelectedTop100Love();
      this.cloudService.resetSelectedTop100Hear();
      this.artistsService.setSelectedArtist(this.artistName);
      this.selectedArtist = this.artistName;
    }
    if (this.favoriteMode) {
      this.categoryService.resetSelectedCategory();
      this.artistsService.resetSelectedArtist();
      this.playListService.resetSelectedPlayList();
      this.cloudService.resetSelectedTop100Love();
      this.cloudService.resetSelectedTop100Hear();
      this.cloudService.setSelectedFavoriteSongs(this.favoriteMode);
      this.selectedFavoriteMode = this.favoriteMode;
    }
    if (this.playlist) {
      this.album.resetSelectedAlbum();
      this.categoryService.resetSelectedCategory();
      this.artistsService.resetSelectedArtist();
      this.cloudService.resetSelectedFavoriteSongs();
      this.cloudService.resetSelectedTop100Love();
      this.cloudService.resetSelectedTop100Hear();
      this.playListService.setSelectedPlayList(this.playlist);
      this.selectedPlayList = this.playlist;
    }
    if (this.top100Love) {
      this.album.resetSelectedAlbum();
      this.artistsService.resetSelectedArtist();
      this.cloudService.resetSelectedFavoriteSongs();
      this.playListService.resetSelectedPlayList();
      this.categoryService.resetSelectedCategory();
      this.cloudService.resetSelectedTop100Hear();
      this.cloudService.setSelectedTop100Love(this.top100Love);
      this.selectedTop100Love = this.top100Love;
    }
    if (this.top100Hear) {
      this.album.resetSelectedAlbum();
      this.artistsService.resetSelectedArtist();
      this.cloudService.resetSelectedFavoriteSongs();
      this.playListService.resetSelectedPlayList();
      this.categoryService.resetSelectedCategory();
      this.cloudService.resetSelectedTop100Love();
      this.cloudService.setSelectedTop100Hear(this.top100Hear);
      this.selectedTop100Hear = this.top100Hear;
    }
    this.cloudService.setSelectedSongId(file.id);
    this.songInfoService.setStatusAudio('play');
    this.cloudService.updateCurrentPlayList();
  }

  onNavigateToAlbum(currentFile) {
    this.router.navigate(['/albums', currentFile.file.userId], { queryParams: { username: currentFile.file.userName } });
  }

  onNavigateToSongInfo(currentFile) {
    this.cloudService.setSelectedSong(currentFile.file);
    this.router.navigate(['/song-info'], { queryParams: { songId: currentFile.file.id } });
  }

  isEmpty() {
    return this.validateService.isEmpty(this.currentFile);
  }

  onSeeVideo(file) {
    this.dialog.open(PopupVideoComponent, { data: file });
  }

}
