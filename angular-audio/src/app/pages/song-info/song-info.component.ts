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
    public dialog: MatDialog) { }

  ngOnInit() {
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
    // this.cloudService.getUpdatedSongsAfterLikingSubject().pipe(
    //   takeUntil(this.destroySubsction$)
    // ).subscribe(files => {
    //   if (this.isMatch) {
    //     this.selectedSong = { ...files[0] };
    //     if (this.isLiked()) {
    //       this.likedUsers++;
    //     } else {
    //       this.likedUsers--;
    //     }
    //   }
    // });
    this.cloudService.getUpdateSongAfterAddCommentSubject().pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe(song => this.selectedSong = { ...song });
    this.cloudService.getUpdateSongAfterManipulatingSubject().pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe(updatedSong => {
      if (this.selectedSong.id === updatedSong.id) {
        this.isMatch = true;
        this.selectedSong = { ...updatedSong };
        if (this.isLiked() && !updatedSong.block && !updatedSong.displayBtn) {
          this.likedUsers++;
        } else if (!this.isLiked() && !updatedSong.block && !updatedSong.displayBtn) {
          this.likedUsers--;
        }
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
    });
  }

  fetchData() {
    this.selectedSong = this.cloudService.getSelectedSong();
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
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy() {
    this.destroySubsction$.next(true);
  }

  formatLikedUserOfSong(likedUsers): string {
    if (likedUsers >= 1000) {
      return (likedUsers / 1000).toFixed(1) + 'K';
    }
    if (likedUsers >= 1000000) {
      return (likedUsers / 1000000).toFixed(1) + 'M';
    }
    return likedUsers;
  }

  formatComments(comments): string {
    if (comments >= 1000) {
      return (comments / 1000).toFixed(1) + 'K';
    }
    if (comments >= 1000000) {
      return (comments / 1000000).toFixed(1) + 'M';
    }
    return comments;
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
      this.cloudService.setSelectedSongId(this.seletedSongId);
      this.isMatch = true;
      this.isPlay = true;
      this.cloudService.updateCurrentPlayList();
      this.audioService.updatePlayMode();
      // if (this.username && this.selectedAlbum === this.username || this.categoryName && this.selectedCategory === this.categoryName
      //   || this.artistName && this.selectedArtist === this.artistName || this.playlist && this.selectedPlayList === this.playlist) {
      //   this.currentFile = { index, file };
      // }
      this.audioService.updateCurrentFile1({ index: 0, file: this.selectedSong });
      this.audioService.stop();
      this.audioService.playStream(this.selectedSong.url).subscribe();
      this.reset();
      // this.isMatchCurrentPlayListAndCurrentPlayerAudio = true;
      // this.cloudService.getUpdatedSongsAfterLikingSubject().next(this.files);
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
    return this.cloudService.likeSong({ id: this.selectedSong.id }).pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe(song => {
      this.selectedSong = { ...song };
      if (this.isLiked()) {
        this.alertify.success('Like successfully');
      } else {
        this.alertify.success('Unlike successfully');
      }
      // this.selectedSong.likedUsers = [...song.likedUsers];
      // if (this.isMatch) {
      //   this.cloudService.getUpdatedSongsAfterLikingSubject().next([this.selectedSong]);
      //   if (this.isLiked()) {
      //     this.alertify.success('Like successfully');
      //   } else {
      //     this.alertify.success('Unlike successfully');
      //   }
      // } else {
      //   this.checkActionLikeOrUnLike();
      // }
      if (!this.audioService.getPlayMode()) {
        this.cloudService.setCurrentPlayList([this.selectedSong]);
      }
      this.cloudService.getUpdateSongAfterManipulatingSubject().next(song);
    }, err => console.log(err));
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
    this.cloudService.blockSong({ id: this.selectedSong.id }).pipe(
      takeUntil(this.destroySubsction$)
    ).subscribe(blockedSongs => {
      console.log(blockedSongs);
      this.cloudService.setBlockedSongsOfUser(blockedSongs);
      this.cloudService.getBlockedSongsAfterBlockSubject().next(this.selectedSong);
      if (!this.isBlocked) {
        this.alertify.success('Block successfully');
        this.isBlocked = true;
        this.isPlay = false;
      } else {
        this.alertify.success('UnBlock successfully');
        this.isBlocked = false;
        this.isPlay = false;
      }
    });
  }

  onSeeComments() {
    this.dialog.open(PopupCommentsComponent, { data: this.selectedSong });
  }

}
