import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CloudService } from 'src/app/services/cloud.service';
import { Router, ActivatedRoute, RouterEvent, NavigationEnd } from '@angular/router';
import { ArtistsService } from 'src/app/services/artists.service';
import { takeUntil, filter, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CategoryService } from 'src/app/services/categories.service';
import { AudioService } from 'src/app/services/audio.service';
import { SongInfoService } from 'src/app/services/song-info.service';
import { AlbumService } from 'src/app/services/album.service';
import { PlayListService } from 'src/app/services/playlist.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { MatDialog } from '@angular/material';
import { PopupMoveSongToPlaylistComponent } from '../manage-playlist/popup-move-song-to-playlist/popup-move-song-to-playlist.component';
import { PopupThreeTypesComponent } from '../player/popup-three-types/popup-three-types.component';
import { PopupCommentsComponent } from './popup-comments/popup-comments.component';
import { SocketIoService } from 'src/app/services/socket-io.service';
import { environment } from 'src/environments/environment';
import { ValidateService } from 'src/app/services/validate.service';

@Component({
  selector: 'app-song-info',
  templateUrl: './song-info.component.html',
  styleUrls: ['./song-info.component.scss']
})
export class SongInfoComponent implements OnInit, OnDestroy, AfterViewInit {

  destroySubsction$: Subject<boolean> = new Subject();
  selectedSong: any;
  likedUsers = 0;
  artist: any;
  category: any;
  isPlay = false;
  seletedSongId: any;
  isMatch = false;
  currentUser: any;
  isBlocked = false;
  top20FavoriteSongs: any[];
  indexInterested = -1;
  uploader: any;
  arrSongContent = [];
  hideMode = true;

  loadingLike = false;
  loadingBlock = false;
  loadingFollow = false;

  SERVER_URL_VIDEO: string;
  SERVER_URL_IMAGE: string;

  constructor(
    private cloudService: CloudService,
    private router: Router,
    private artistService: ArtistsService,
    private categoryService: CategoryService,
    private audioService: AudioService,
    private route: ActivatedRoute,
    private songInfoService: SongInfoService,
    private album: AlbumService,
    private artistsService: ArtistsService,
    private playListService: PlayListService,
    private authService: AuthService,
    private alertify: AlertifyService,
    public dialog: MatDialog,
    private socketIo: SocketIoService,
    private validateService: ValidateService) {
    this.SERVER_URL_IMAGE = environment.SERVER_URL_IMAGE;
    this.SERVER_URL_VIDEO = environment.SERVER_URL_VIDEO;
  }

  ngOnInit() {
    // if (this.songInfoService.getStatusAudio() === 'pause') {
    //   this.songInfoService.setStatusAudio('play');
    // }
    this.currentUser = this.authService.getCurrentUser();
    this.route.queryParams.subscribe(param => {
      this.isPlay = false;
      this.isBlocked = false;
      this.seletedSongId = param.songId;
      if (!this.cloudService.getSelectedSongId()) {
        this.isMatch = true;
      } else {
        this.isMatch = this.cloudService.getSelectedSongId() && this.cloudService.getSelectedSongId() === this.seletedSongId ? true : false;
        if (this.isMatch && this.songInfoService.getStatusAudio() === 'play') {
          this.isPlay = true;
        }
      }
      this.fetchData();
    });
    this.listenerEvent();
    this.loadTop20FavoriteSongs();
  }

  loadTop20FavoriteSongs() {
    this.cloudService.getTop20FavarotieSongs().pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe(songs => {
      this.top20FavoriteSongs = [...songs];
    });
  }

  listenerEvent() {
    this.songInfoService.getModeSubject().pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe(mode => {
      if (mode === 'displayBtnPause') {
        this.isPlay = true;
      } else {
        this.isPlay = false;
      }
    });
    if (this.selectedSong.playlistId) {
      this.selectedSong.playlistId = null;
    }
    this.socketIo.getCommentsRealTime().pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe((song: any) => {
      if (song.id === this.selectedSong.id) {
        this.selectedSong = { ...song };
      }
      if (this.top20FavoriteSongs && this.top20FavoriteSongs.filter(item => item.id === song.id).length > 0) {
        const index = this.top20FavoriteSongs.findIndex(item => item.id === song.id);
        this.top20FavoriteSongs =
          [...this.top20FavoriteSongs.filter((v, i) => i < index), { ...song }, ...this.top20FavoriteSongs.filter((v, i) => i > index)];
      }
    });
    this.cloudService.getUpdateSongAfterManipulatingSubject().pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe(updatedSong => {
      if (this.selectedSong.id === updatedSong.id) {
        this.isMatch = true;
        this.selectedSong = { ...updatedSong };
        if (updatedSong.block) {
          this.isBlocked = !this.isBlocked;
          this.isPlay = false;
        }
        if (updatedSong.displayBtn) {
          if (updatedSong.displayBtn === 'displayBtnPause') {
            this.isPlay = true;
          } else {
            this.isPlay = false;
          }
        }
      } else {
        this.isMatch = false;
      }
      if (this.top20FavoriteSongs && this.top20FavoriteSongs.filter(item => item.id === updatedSong.id).length > 0) {
        const index = this.top20FavoriteSongs.findIndex(item => item.id === updatedSong.id);
        this.top20FavoriteSongs =
          [...this.top20FavoriteSongs.filter((v, i) => i < index),
          { ...updatedSong },
          ...this.top20FavoriteSongs.filter((v, i) => i > index)];
      }
    });
    this.socketIo.getLikeSongRealTime().pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe((song: any) => {
      if (this.selectedSong.id === song.id) {
        this.selectedSong = { ...song };
        this.likedUsers = this.selectedSong.likedUsers.length;
      }
      if (this.top20FavoriteSongs && this.top20FavoriteSongs.filter(item => item.id === song.id).length > 0) {
        const index = this.top20FavoriteSongs.findIndex(item => item.id === song.id);
        this.top20FavoriteSongs =
          [...this.top20FavoriteSongs.filter((v, i) => i < index), { ...song }, ...this.top20FavoriteSongs.filter((v, i) => i > index)];
      }
    });
    this.socketIo.getViewsRealTime().pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe((song: any) => {
      if (this.selectedSong.id === song.id) {
        this.selectedSong = { ...song };
        this.likedUsers = this.selectedSong.likedUsers.length;
      }
      if (this.top20FavoriteSongs && this.top20FavoriteSongs.filter(item => item.id === song.id).length > 0) {
        const index = this.top20FavoriteSongs.findIndex(item => item.id === song.id);
        this.top20FavoriteSongs =
          [...this.top20FavoriteSongs.filter((v, i) => i < index), { ...song }, ...this.top20FavoriteSongs.filter((v, i) => i > index)];
      }
    });
    this.socketIo.getFollwersRealTime().pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe((res: any) => {
      if (this.uploader.id === res.followedUser.id) {
        this.uploader = { ...res.followedUser };
      }
    });
  }

  fetchData() {
    this.hideMode = true;
    this.selectedSong = this.cloudService.getSelectedSong();
    this.arrSongContent = this.selectedSong.songcontent.detail.split('\n');
    this.likedUsers = this.selectedSong.likedUsers.length;
    this.cloudService.setCurrentPlayList([this.selectedSong]);
    if (this.selectedSong.artistId) {
      this.artistService.getArtistById({ id: this.selectedSong.artistId })
        .pipe(takeUntil(this.destroySubsction$))
        .subscribe(artist => this.artist = artist[0]);
    }
    if (this.selectedSong.categoryId) {
      this.categoryService.getCategoryById({ id: this.selectedSong.categoryId }).pipe(
        takeUntil(this.destroySubsction$)
      ).subscribe(category => this.category = category[0]);
    }
    this.authService.getUserById(this.selectedSong.userId).pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe(user => this.uploader = { ...user });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy() {
    this.destroySubsction$.next(true);
  }

  formatNumber(numb): string {
    if (numb >= 1000) {
      return (numb / 1000).toFixed(1) + 'K';
    }
    if (numb >= 1000000) {
      return (numb / 1000000).toFixed(1) + 'M';
    }
    return numb;
  }

  formatComments(comments): string {
    let result = comments.length;
    comments.forEach(comment => {
      result += comment.subComments.length;
    });
    if (result >= 1000) {
      return (result / 1000).toFixed(1) + 'K';
    }
    if (result >= 1000000) {
      return (result / 1000000).toFixed(1) + 'M';
    }
    return result;
  }

  onSeeAlbumOfUser() {
    this.router.navigate(['/albums', this.selectedSong.userId], { queryParams: { username: this.selectedSong.userName } });
  }

  onSeeArtistOfSong() {
    this.router.navigate(['/artists', this.artist.id], { queryParams: { artistName: this.artist.name } });
  }

  onSeeCategoryOfSong() {
    this.router.navigate(['/categories', this.category.id], { queryParams: { categoryName: this.category.name } });
  }

  openFile() {
    if ((this.isMatch && !this.audioService.getPlayMode()) || !this.isMatch) {
      this.cloudService.resetTempAndLastCurrentTime().next(true);
      this.cloudService.setSelectedSongId(this.seletedSongId);
      this.isMatch = true;
      this.isPlay = true;
      this.cloudService.updateCurrentPlayList();
      this.audioService.updatePlayMode();
      this.audioService.updateCurrentFile1({ index: 0, file: this.selectedSong });
      this.audioService.stop();
      this.audioService.playStream(this.selectedSong.url).subscribe();
      this.reset();
    } else if (!this.isPlay) {
      this.isPlay = true;
      this.audioService.play();
    }
  }

  stopFile() {
    this.isPlay = false;
    this.audioService.pause();
  }

  reset() {
    this.album.resetSelectedAlbum();
    this.categoryService.resetSelectedCategory();
    this.artistsService.resetSelectedArtist();
    this.cloudService.resetSelectedFavoriteSongs();
    this.playListService.resetSelectedPlayList();
  }

  onLikeSong() {
    if (!this.loadingLike) {
      this.loadingLike = true;
      this.cloudService.likeSong({ id: this.selectedSong.id }).pipe(
        takeUntil(this.destroySubsction$)
      ).subscribe(song => {
        this.selectedSong = { ...song };
        if (this.isLiked()) {
          this.alertify.success('Like successfully');
        } else {
          this.alertify.success('Unlike successfully');
        }
        if (!this.audioService.getPlayMode()) {
          this.cloudService.setCurrentPlayList([this.selectedSong]);
        }
        this.cloudService.getUpdateSongAfterManipulatingSubject().next(song);
        this.loadingLike = false;
      }, err => this.loadingLike = false);
    }
  }

  isLiked(): boolean {
    if (this.currentUser) {
      return this.selectedSong.likedUsers.filter(like => like.user === this.currentUser.id).length > 0;
    }
  }

  checkActionLikeOrUnLike() {
    if (this.isLiked()) {
      this.likedUsers++;
      this.alertify.success('Like successfully');
    } else {
      this.likedUsers--;
      this.alertify.success('Unlike successfully');
    }
  }

  onAddSongToPlayList() {
    this.dialog.open(PopupMoveSongToPlaylistComponent, { data: this.selectedSong });
  }

  onDownloadFile() {
    this.dialog.open(PopupThreeTypesComponent, { data: this.selectedSong });
  }

  onBlock() {
    if (!this.loadingBlock) {
      this.loadingBlock = true;
      this.cloudService.blockSong({ id: this.selectedSong.id }).pipe(
        takeUntil(this.destroySubsction$)
      ).subscribe((blockedSongs: any[]) => {
        this.cloudService.setBlockedSongsOfUser(blockedSongs);
        this.cloudService.getBlockedSongsAfterBlockSubject().next(this.selectedSong);
        if (!this.isBlocked) {
          this.alertify.success('Block successfully');
          this.isBlocked = true;
          this.isPlay = false;
          if (this.top20FavoriteSongs && this.top20FavoriteSongs.filter(song => song.id === this.selectedSong.id).length > 0) {
            this.top20FavoriteSongs = this.top20FavoriteSongs.filter(song => song.id !== this.selectedSong.id);
          }
        } else {
          this.alertify.success('UnBlock successfully');
          this.isBlocked = false;
          this.isPlay = false;
        }
        this.loadingBlock = false;
      }, err => this.loadingBlock = false);
    }
  }

  onSeeComments() {
    this.dialog.open(PopupCommentsComponent, { data: this.selectedSong });
  }

  navigateToSongInfo(song, index) {
    this.indexInterested = index;
    this.cloudService.setSelectedSong(song);
    this.router.navigate(['/song-info'], { queryParams: { songId: song.id } });
  }

  navigateToUploader(uploader) {
    this.router.navigate(['/albums', uploader.id], { queryParams: { username: uploader.username } });
  }

  follows(uploader) {
    this.loadingFollow = true;
    this.authService.followsUser({ id: uploader.id }).pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe((res: any) => {
      this.alertify.success(`${res.message} ${uploader.username} successfully`);
      this.loadingFollow = false;
    }, err => this.loadingFollow = false);
  }

  isFollowed(uploader) {
    return uploader.followers.filter(id => id === this.currentUser.id).length > 0;
  }

  copyLyrics() {
    const el = document.createElement('textarea');
    el.value = this.selectedSong.songcontent.detail;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.alertify.success('Copied');
  }

  isEmpty(data) {
    return this.validateService.isEmpty(data);
  }

  onAddSongToCurrentPlayList() {
    this.cloudService.getUpdateSongsAfterAdd().next(this.selectedSong);
  }

}
