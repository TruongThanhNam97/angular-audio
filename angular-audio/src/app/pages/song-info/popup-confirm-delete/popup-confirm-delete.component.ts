import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CloudService } from 'src/app/services/cloud.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AlertifyService } from 'src/app/services/alertify.service';
import { SocketIoService } from 'src/app/services/socket-io.service';

@Component({
  selector: 'app-popup-confirm-delete',
  templateUrl: './popup-confirm-delete.component.html',
  styleUrls: ['./popup-confirm-delete.component.scss']
})
export class PopupConfirmDeleteComponent implements OnInit, OnDestroy {

  destroySubscription$: Subject<boolean> = new Subject();

  loading = false;

  constructor(
    public dialogRef: MatDialogRef<PopupConfirmDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cloudService: CloudService,
    private alertify: AlertifyService,
    private socketIo: SocketIoService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  onClose() {
    this.dialogRef.close();
  }

  onDelete() {
    this.loading = true;
    if (!this.data.commentId) {
      this.cloudService.deleteComment({ songId: this.data.songId, commentId: this.data._id }).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(song => {
        this.cloudService.setSelectedSong(song);
        this.socketIo.sendCommentRealTime();
        this.alertify.success('Delete comment successfully');
        this.dialogRef.close();
        this.loading = false;
      }, err => this.loading = false);
    } else {
      this.cloudService.deleteSubComment({ songId: this.data.songId, commentId: this.data.commentId, subCommentId: this.data._id }).pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe(song => {
        this.cloudService.setSelectedSong(song);
        this.socketIo.sendCommentRealTime();
        this.alertify.success('Delete subComment successfully');
        this.dialogRef.close();
        this.loading = false;
      }, err => this.loading = false);
    }
  }

}
