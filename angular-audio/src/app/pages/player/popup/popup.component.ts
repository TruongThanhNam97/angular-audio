import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { PlayerComponent } from '../player.component';
import { PopupThreeTypesComponent } from '../popup-three-types/popup-three-types.component';
import { CloudService } from 'src/app/services/cloud.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertifyService } from 'src/app/services/alertify.service';
import { AuthService } from 'src/app/services/auth.service';

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
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy() {
    this.destroySubscriptions.next(true);
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
    });
  }

}
