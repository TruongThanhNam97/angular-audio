import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertifyService } from 'src/app/services/alertify.service';
import { PlayListService } from 'src/app/services/playlist.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-popup-move-song-to-playlist',
  templateUrl: './popup-move-song-to-playlist.component.html',
  styleUrls: ['./popup-move-song-to-playlist.component.scss']
})
export class PopupMoveSongToPlaylistComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();
  signForm: FormGroup;
  playLists: any[];
  playlistName: string;

  constructor(
    public dialogRef: MatDialogRef<PopupMoveSongToPlaylistComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private alertify: AlertifyService,
    private playlistService: PlayListService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadPlayLists();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  initializeForm() {
    this.signForm = new FormGroup({
      playlistId: new FormControl(null),
      name: new FormControl(null, [Validators.required])
    });
  }

  loadPlayLists() {
    this.playlistService.getPlayListByUser().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((playLists: any[]) => this.playLists = [...playLists]);
  }

  onAddToPlayList(playlist) {
    const data = {
      playlistId: playlist._id,
      songId: this.data.id
    };
    this.playlistService.addSongToPlayList(data).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(updatedPlaylist => {
      this.alertify.success('Successfully');
      this.dialogRef.close();
      this.playlistService.getUdatedPlayListAfterAddOrDeleteSongSubject().next(updatedPlaylist);
    }, err => this.alertify.error(err.error));
  }

  onSubmit() {
    this.playlistService.createPlayList(this.signForm.value).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((playList: any) => {
      const data = {
        playlistId: playList._id,
        songId: this.data.id
      };
      this.playlistService.addSongToPlayList(data).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(updatedPlaylist => {
        this.alertify.success('Successfully');
        this.dialogRef.close();
        this.playlistService.getUdatedPlayListAfterAddOrDeleteSongSubject().next(updatedPlaylist);
      }, err => this.alertify.error(err.error));
    });
  }

}
