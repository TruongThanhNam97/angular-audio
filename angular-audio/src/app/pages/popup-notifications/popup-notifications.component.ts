import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SocketIoService } from 'src/app/services/socket-io.service';
import { Router } from '@angular/router';
import { CloudService } from 'src/app/services/cloud.service';

@Component({
  selector: 'app-popup-notifications',
  templateUrl: './popup-notifications.component.html',
  styleUrls: ['./popup-notifications.component.scss']
})
export class PopupNotificationsComponent implements OnInit, OnDestroy {

  SERVER_URL_IMAGE: string;
  SERVER_URL_SOUND: string;
  destroySubscription$: Subject<boolean> = new Subject();
  currentUser: any;

  constructor(
    public dialogRef: MatDialogRef<PopupNotificationsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private socketIo: SocketIoService,
    private router: Router,
    private cloudService: CloudService
  ) {
    this.SERVER_URL_IMAGE = environment.SERVER_URL_IMAGE;
    this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.socketIo.getNotificationsRealTime().pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((res: any) => {
      console.log(res);
      if (this.currentUser
        && res.owner.filter(id => id === this.currentUser.id).length > 0
        && res.notifications.length === 1
        && res.notifications[0].mode === 'upload'
      ) {
        this.data = [...res.notifications, ...this.data];
      } else if (this.currentUser && res.owner.filter(id => id === this.currentUser.id).length > 0) {
        this.data = [...res.notifications];
      }
    });
    if (this.data.filter(noti => noti.isRead === false).length > 0) {
      this.authService.readAllNotifications().pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe((notifications: any) => {
        this.data = [...notifications];
        this.authService.getUpdatedNotifications().next(notifications);
      });
    }
  }

  ngOnDestroy() {
    this.destroySubscription$.next(true);
  }

  onClose() {
    this.dialogRef.close();
  }

  onClearAll() {
    if (this.data.length > 0) {
      this.authService.clearAllNotifications().pipe(
        takeUntil(this.destroySubscription$)
      ).subscribe((notifications: any) => {
        this.data = [...notifications];
        this.authService.getUpdatedNotifications().next(notifications);
      });
    }
  }

  onDeleteNotification(notification) {
    this.authService.deleteNotification({ id: notification._id }).pipe(
      takeUntil(this.destroySubscription$)
    ).subscribe((notifications: any) => {
      this.data = [...notifications];
      this.authService.getUpdatedNotifications().next(notifications);
    });
  }

  onNavigate(notification) {
    if (notification.mode === 'follow' || notification.mode === 'unfollow' || notification.mode === 'upload') {
      this.dialogRef.close();
      this.router.navigate(['/albums', notification.user._id], { queryParams: { username: notification.user.username } });
    }
    if (notification.mode === 'like' || notification.mode === 'comment' || notification.mode === 'approveLyrics'
      || notification.mode === 'approveVideo') {
      let song = JSON.parse(notification.song);
      song = {
        id: song._id,
        url: this.SERVER_URL_SOUND + song.url,
        name: song.name,
        artist: song.artist,
        nameToDownload: song.url,
        userId: song.userId,
        userName: song.userName,
        categoryId: song.categoryId ? song.categoryId : null,
        artistId: song.artistId ? song.artistId : null,
        likedUsers: song.likedUsers,
        comments: song.comments ? song.comments : [],
        songcontent: song.songcontent,
        video: song.video ? song.video : null,
        views: song.views
      };
      this.cloudService.setSelectedSong(song);
      this.dialogRef.close();
      this.router.navigate(['/song-info'], { queryParams: { songId: song.id } });
    }
    this.onDeleteNotification(notification);
  }

}
