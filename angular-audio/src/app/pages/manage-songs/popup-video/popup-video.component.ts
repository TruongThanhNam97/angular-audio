import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { CloudService } from 'src/app/services/cloud.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-popup-video',
  templateUrl: './popup-video.component.html',
  styleUrls: ['./popup-video.component.scss']
})
export class PopupVideoComponent implements OnInit, OnDestroy {

  SERVER_URL_VIDEO: string;
  currentUser: any;
  destroySubscription$: Subject<boolean> = new Subject();

  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupVideoComponent>,
    private authService: AuthService,
    private cloudService: CloudService,
    private alertify: AlertifyService
  ) {
    this.SERVER_URL_VIDEO = environment.SERVER_URL_VIDEO;
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  approve() {
    this.loading = true;
    this.cloudService.approveSong({ id: this.data.id, mode: 'approve' }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      this.alertify.success('Approve successfully');
      this.dialogRef.close();
      this.cloudService.getUpdateSongAfterEdit().next(song);
      this.loading = false;
    }, _ => this.loading = false);
  }

  reject() {
    this.loading = true;
    this.cloudService.approveSong({ id: this.data.id, mode: 'reject' }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe(song => {
      this.alertify.success('Approve successfully');
      this.dialogRef.close();
      this.cloudService.getUpdateSongAfterEdit().next(song);
      this.loading = false;
    }, _ => this.loading = false);
  }

}
