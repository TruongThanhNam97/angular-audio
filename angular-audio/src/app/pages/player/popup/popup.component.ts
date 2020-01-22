import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { PlayerComponent } from '../player.component';
import { PopupThreeTypesComponent } from '../popup-three-types/popup-three-types.component';
import { CloudService } from 'src/app/services/cloud.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertifyService } from 'src/app/services/alertify.service';
import { AuthService } from 'src/app/services/auth.service';
import { PopupMoveSongToPlaylistComponent } from '../../manage-playlist/popup-move-song-to-playlist/popup-move-song-to-playlist.component';
import { PlayListService } from 'src/app/services/playlist.service';
import { ThrowStmt } from '@angular/compiler';
import { Router } from '@angular/router';
import { SocketIoService } from 'src/app/services/socket-io.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit, OnDestroy {

  destroySubscriptions: Subject<boolean> = new Subject();

  currentUser: any;

  constructor(
    public dialogRef: MatDialogRef<PlayerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private cloudService: CloudService,
    private alertify: AlertifyService,
    private authService: AuthService,
    private playlistService: PlayListService,
    private router: Router,
    private socketIo: SocketIoService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.socketIo.getLikeSongRealTime().pipe(
      takeUntil(this.destroySubscriptions)
    ).subscribe((song: any) => {
      if (this.data.id === song.id) {
        this.data = { ...song };
      }
    });
  }

  ngOnDestroy() {
    this.destroySubscriptions.next(true);
  }

  formatLikedUsers(likedUsers): string {
    if (likedUsers >= 1000) {
      return (likedUsers / 1000).toFixed(1) + 'K';
    }
    if (likedUsers >= 1000000) {
      return (likedUsers / 1000000).toFixed(1) + 'M';
    }
    return likedUsers;
  }

  onSeeSongInfo() {
    this.cloudService.setSelectedSong(this.data);
    this.router.navigate(['/song-info'], { queryParams: { songId: this.data.id } });
    this.dialogRef.close();
  }

  downloadFile() {
    this.dialog.open(PopupThreeTypesComponent, { data: this.data });
    this.dialogRef.close();
  }

  onBlock() {
    this.cloudService.blockSong({ id: this.data.id }).pipe(
      takeUntil(this.destroySubscriptions)
    ).subscribe(blockedSongs => {
      this.cloudService.setBlockedSongsOfUser(blockedSongs);
      this.dialogRef.close();
      this.alertify.success('Block successfully');
      this.cloudService.getBlockedSongsAfterBlockSubject().next(this.data);
      this.cloudService.getUpdateSongAfterManipulatingSubject().next({ ...this.data, block: true });
    });
  }

  onAddSongToPlayList() {
    this.dialog.open(PopupMoveSongToPlaylistComponent, { data: this.data });
    this.dialogRef.close();
  }

  onDeleteSongFromPlayList() {
    const data = {
      playlistId: this.data.playlistId,
      songId: this.data.id
    };
    this.playlistService.deleteSongFromPlayList(data).pipe(
      takeUntil(this.destroySubscriptions)
    ).subscribe(playlist => {
      this.dialogRef.close();
      this.alertify.success('Delete successfully');
      this.playlistService.getUdatedPlayListAfterAddOrDeleteSongSubject().next(playlist);
      this.playlistService.getListSongsAfterDeleteFromPlayListSubject().next({ playlist, songId: this.data.id });
    });
  }

}
