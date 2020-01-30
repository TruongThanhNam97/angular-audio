import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PlayListService } from 'src/app/services/playlist.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-popup-playlist',
  templateUrl: './popup-playlist.component.html',
  styleUrls: ['./popup-playlist.component.scss']
})
export class PopupPlaylistComponent implements OnInit, OnDestroy {

  signForm: FormGroup;
  destroySubscription$: Subject<boolean> = new Subject();
  disableMode = false;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<PopupPlaylistComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private playListService: PlayListService,
    private alertify: AlertifyService) { }

  ngOnInit() {
    if (this.data.mode !== 'delete') {
      this.initializeForm();
      if (this.data.mode === 'edit') {
        this.signForm.patchValue({
          playlistId: this.data.selected._id,
          name: this.data.selected.name
        });
      }
    }
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

  onSubmit() {
    this.signForm.disable();
    this.disableMode = true;
    this.loading = true;
    if (this.data.mode === 'create') {
      this.playListService.createPlayList(this.signForm.value).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(playList => {
        this.playListService.getCreatedPlayListSubject().next(playList);
        this.dialogRef.close();
        this.alertify.success('Create playlist successfully');
        this.loading = false;
      }, err => {
        this.disableMode = false;
        this.signForm.enable();
        this.loading = false;
      });
    }
    if (this.data.mode === 'edit') {
      this.playListService.editPlayList(this.signForm.value).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(playList => {
        this.playListService.getUpdatedPlayListSubject().next(playList);
        this.dialogRef.close();
        this.alertify.success('Edit playlist successfully');
        this.loading = false;
      }, err => {
        this.disableMode = false;
        this.signForm.enable();
        this.loading = false;
      });
    }
  }

  onNo() {
    this.dialogRef.close();
  }

  onYes() {
    this.disableMode = true;
    this.loading = true;
    this.playListService.deletePlayList({ playlistId: this.data.selected._id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(playlist => {
      this.playListService.getDeletedPlayListSubject().next(playlist);
      this.dialogRef.close();
      this.alertify.success('Delete successfully');
      this.loading = false;
    }, err => {
      this.disableMode = false;
      this.loading = false;
    });
  }

}
