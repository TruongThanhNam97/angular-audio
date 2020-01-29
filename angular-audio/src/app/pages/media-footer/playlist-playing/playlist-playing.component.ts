import { Component, OnInit, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { StreamState } from 'src/app/interfaces/stream-state';
import { Subject } from 'rxjs';
import { AudioService } from 'src/app/services/audio.service';
import { MatDialog, MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';
import { AlbumService } from 'src/app/services/album.service';
import { CategoryService } from 'src/app/services/categories.service';
import { PopupComponent } from '../../player/popup/popup.component';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { CloudService } from 'src/app/services/cloud.service';
import { PlayListService } from 'src/app/services/playlist.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { SongInfoService } from 'src/app/services/song-info.service';
import { SocketIoService } from 'src/app/services/socket-io.service';
import { Router } from '@angular/router';
import { ValidateService } from 'src/app/services/validate.service';
import { PopupVideoComponent } from '../../manage-songs/popup-video/popup-video.component';

@Component({
  selector: 'app-playlist-playing',
  templateUrl: './playlist-playing.component.html',
  styleUrls: ['./playlist-playing.component.scss']
})
export class PlaylistPlayingComponent implements OnInit, OnDestroy {

  files: any[];
  state: StreamState;
  currentFile: any = {};
  currentUser: any;
  destroySubscription$: Subject<boolean> = new Subject();
  loading = false;
  username: string;
  id: string;
  categoryName: string;
  arrSongContent = [];
  filterNameArtist: string;

  constructor(
    private audioService: AudioService,
    public dialog: MatDialog,
    private album: AlbumService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private cdt: ChangeDetectorRef,
    private cloudService: CloudService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    public bottomSheetRef: MatBottomSheetRef<PlaylistPlayingComponent>,
    private playlistService: PlayListService,
    private alertify: AlertifyService,
    private songInfoService: SongInfoService,
    private socketIo: SocketIoService,
    private router: Router,
    private validateService: ValidateService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.files = [...this.data];
    this.currentFile = this.audioService.getCurrentFile();
    console.log(this.currentFile);
    this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
    this.audioService.getResetCurrentFileSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(currentFile => {
      if (currentFile) {
        this.currentFile = currentFile;
        this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
      }
    });
    this.audioService.getCurrentFileSubject2().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((v: any) => {
      this.currentFile = { index: v.index, file: v.file };
      this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
      // this.cloudService.setCurr
      this.cdt.detectChanges();
    });
    this.cloudService.getUpdatedSongsAfterLikingSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(files => this.files = [...files]);
    this.cloudService.getBlockedSongsAfterBlockSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(blockedSong => {
      this.files = this.files.filter(song => song.id !== blockedSong.id);
      this.cdt.detectChanges();
    });
    this.cloudService.getUpdateSongsAfterDelete().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(selectedSong => {
      this.files = this.files.filter(song => song.id !== selectedSong.id);
      this.cdt.detectChanges();
    });
    this.playlistService.getListSongsAfterDeleteFromPlayListSubject().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(data => {
      this.files = this.files.filter(song => song.id !== data.songId);
      this.cdt.detectChanges();
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
        this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
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
        this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
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
        this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
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
    ).subscribe(updatedSong => {
      const index = this.files.findIndex(item => item.id === updatedSong.id);
      this.files = [...this.files.filter((v, i) => i < index), { ...updatedSong }, ...this.files.filter((v, i) => i > index)];
      this.cdt.detectChanges();
      if (song.playlistId && song.playlistName) {
        this.files = this.files.map(item => {
          item.playlistId = song.playlistId;
          item.playlistName = song.playlistName;
          return item;
        });
      }
      this.cloudService.getUpdatedSongsAfterLikingSubject().next(this.files);
      if (this.isLiked(updatedSong)) {
        this.alertify.success('Like successfully');
      } else {
        this.alertify.success('UnLike successfully');
      }
      this.cloudService.getUpdateSongAfterManipulatingSubject().next(updatedSong);
      // this.socketIo.likeSongRealTime();
    }, err => console.log(err));
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  openFile(file, index) {
    const exactIndex = this.files.findIndex(item => item.id === file.id);
    this.cloudService.resetTempAndLastCurrentTime().next(true);
    this.cloudService.setSelectedSongId(file.id);
    this.songInfoService.getModeSubject().next('displayBtnPlay');
    this.audioService.updatePlayMode();
    this.currentFile = { index: exactIndex, file };
    this.arrSongContent = this.currentFile.file.songcontent.detail.split('\n');
    this.audioService.updateCurrentFile1({ index: exactIndex, file });
    this.audioService.stop();
    this.audioService.playStream(file.url).subscribe();
    this.cloudService.getCurrentFileSubject().next(this.currentFile);
    this.cloudService.getUpdateSongAfterManipulatingSubject().next({ ...file, displayBtn: 'displayBtnPause' });
    this.songInfoService.setStatusAudio('play');
  }

  openDialog(file: any): void {
    file.temp = 'fromPlaylist';
    this.dialog.open(PopupComponent, { data: file });
  }

  onNavigateToAlbum(currentFile) {
    this.bottomSheetRef.dismiss();
    this.router.navigate(['/albums', currentFile.file.userId], { queryParams: { username: currentFile.file.userName } });
  }

  onNavigateToSongInfo(currentFile) {
    this.bottomSheetRef.dismiss();
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
