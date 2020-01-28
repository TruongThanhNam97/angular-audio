import { Component, OnInit } from '@angular/core';
import { AudioService } from './services/audio.service';
import { AuthService } from './services/auth.service';
import { DECODE_TOKEN } from './interfaces/decode-token';
import decode from 'jwt-decode';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UploadService } from './services/upload.service';
import { SocketIoService } from './services/socket-io.service';
import { AlertifyService } from './services/alertify.service';
import { MatDialog } from '@angular/material';
import { PopupNotificationsComponent } from './pages/popup-notifications/popup-notifications.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', '../../node_modules/bootstrap/dist/css/bootstrap.min.css']
})
export class AppComponent implements OnInit {
  playMode = false;
  isAuthenticated = false;
  currentUser: DECODE_TOKEN;
  SERVER_URL_IMAGE: string;
  queueProcessing = 0;
  reupDectected: number;
  notifications: any[];
  constructor(
    private audioSerive: AudioService,
    private authService: AuthService,
    private router: Router,
    private uploadService: UploadService,
    private socketIo: SocketIoService,
    private alertify: AlertifyService,
    private dialog: MatDialog) {
    this.SERVER_URL_IMAGE = environment.SERVER_URL_IMAGE;
  }
  ngOnInit() {
    this.checkToken();
    this.audioSerive.getPlayModeSubject().subscribe((v: any) => this.playMode = v);
    this.authService.getIsAuthenticatedSubject().subscribe((isAuthenticated: boolean) => this.isAuthenticated = isAuthenticated);
    this.authService.getCurrentUserSubject().subscribe((currentUser: DECODE_TOKEN) => {
      this.currentUser = currentUser;
      if (this.currentUser) {
        this.reupDectected = this.currentUser.numberOfReup;
      }
    });
    this.uploadService.getQueueProcessingSubject().subscribe((queueProcessing: number) => this.queueProcessing = queueProcessing);
    this.authService.getReupDectectedSubject().subscribe((numberOfReupDectected: number) => this.reupDectected = numberOfReupDectected);
    this.authService.getUpdatedNotifications().subscribe((notifications: any[]) => this.notifications = [...notifications]);
    this.listenerRealTimeBySocketIo();
  }

  listenerRealTimeBySocketIo() {
    this.socketIo.getFollwersRealTime().subscribe((res: any) => {
      console.log(res);
      if (this.currentUser && this.currentUser.id === res.followedUser.id && this.currentUser.id !== res.follower._id) {
        const html = `<div class="wrap-notify">
        <div style="width: 20%;">
          <img src="
          ${res.follower.avatar ?
            this.SERVER_URL_IMAGE + res.follower.avatar
            : '../../../assets/profile-default.jpg'}" alt="${res.follower.username}" style="width: 100%;border-radius: 50%;height:50px;">
        </div>
        <div style="width: 80%;"><strong>${res.follower.username}</strong> has just <strong>${res.message}</strong> you</div>
      </div>`;
        this.alertify.notify(html);
      }
    });
    this.socketIo.getLikeMySongRealTime().subscribe((res: any) => {
      console.log(res);
      if (this.currentUser && this.currentUser.id === res.song.userId && this.currentUser.id !== res.liker._id) {
        const html = `<div class="wrap-notify">
        <div style="width: 20%;">
          <img src="
          ${res.liker.avatar ?
            this.SERVER_URL_IMAGE + res.liker.avatar
            : '../../../assets/profile-default.jpg'}" alt="${res.liker.username}" style="width: 100%;border-radius: 50%;height:50px;">
        </div>
        <div style="width: 80%;"><strong>${res.liker.username}</strong> has just liked <strong>${res.song.name}</strong></div>
      </div>`;
        this.alertify.notify(html);
      }
    });
    this.socketIo.getCommentMySongRealTime().subscribe((res: any) => {
      if (this.currentUser && this.currentUser.id === res.song.userId && this.currentUser.id !== res.commenter._id) {
        const html = `<div class="wrap-notify">
        <div style="width: 20%;">
          <img src="
          ${res.commenter.avatar ?
            this.SERVER_URL_IMAGE + res.commenter.avatar
            : '../../../assets/profile-default.jpg'}" alt="${res.commenter.username}" style="width: 100%;border-radius: 50%;height:50px;">
        </div>
        <div 
        style="width: 80%;"><strong>${res.commenter.username}</strong> has just commented on <strong>${res.song.name}</strong></div>
      </div>`;
        this.alertify.notify(html);
      }
    });
    this.socketIo.getFollowingUploadRealTime().subscribe((res: any) => {
      if (this.currentUser && res.user.numberOfReup < 3
        && res.user.followers.filter(item => item === this.currentUser.id).length > 0
        && res.user._id !== this.currentUser.id
      ) {
        const html = `<div class="wrap-notify">
        <div style="width: 20%;">
          <img src="
          ${res.user.avatar ?
            this.SERVER_URL_IMAGE + res.user.avatar
            : '../../../assets/profile-default.jpg'}" alt="${res.user.username}" style="width: 100%;border-radius: 50%;height:50px;">
        </div>
        <div 
        style="width: 80%;"><strong>${res.user.username}</strong> has just uploaded <strong>new songs</strong></div>
      </div>`;
        this.alertify.notify(html);
      }
    });
    this.socketIo.getAprroveLyricsRealTime().subscribe((res: any) => {
      if (this.currentUser && this.currentUser.id === res.song.userId && this.currentUser.id !== res.approver._id) {
        const html = `<div class="wrap-notify">
        <div style="width: 20%;">
          <img src="
          ${res.approver.avatar ?
            this.SERVER_URL_IMAGE + res.approver.avatar
            : '../../../assets/profile-default.jpg'}" alt="${res.approver.username}" style="width: 100%;border-radius: 50%;height:50px;">
        </div>
        <div 
        style="width: 80%;"><strong>${res.approver.username}</strong> has just approved lyrics of <strong>${res.song.name}</strong></div>
      </div>`;
        this.alertify.notify(html);
      }
    });
    this.socketIo.getConfirmVideoRealTime().subscribe((res: any) => {
      if (this.currentUser && this.currentUser.id === res.song.userId && this.currentUser.id !== res.confirmer._id) {
        const mode = res.song.video.status ? 'approved' : 'rejected';
        const html = `<div class="wrap-notify">
        <div style="width: 20%;">
          <img src="
          ${res.confirmer.avatar ?
            this.SERVER_URL_IMAGE + res.confirmer.avatar
            : '../../../assets/profile-default.jpg'}" alt="${res.confirmer.username}" style="width: 100%;border-radius: 50%;height:50px;">
        </div>
        <div 
        style="width: 80%;"><strong>${res.confirmer.username}</strong> has just ${mode} video of <strong>${res.song.name}</strong></div>
      </div>`;
        this.alertify.notify(html);
      }
    });
    this.socketIo.getNotificationsRealTime().subscribe((res: any) => {
      console.log(res);
      if (this.currentUser
        && res.owner.filter(id => id === this.currentUser.id).length > 0
        && res.notifications.length === 1
        && res.notifications[0].mode === 'upload'
      ) {
        this.notifications = [...res.notifications, ...this.notifications];
      } else if (this.currentUser && res.owner.filter(id => id === this.currentUser.id).length > 0) {
        this.notifications = [...res.notifications];
      }
    });
  }

  checkToken() {
    if (localStorage.getItem('jwtToken')) {
      const token = localStorage.getItem('jwtToken');
      const user: DECODE_TOKEN = decode(token);
      const expire = user.exp;
      const now = Math.round(new Date().getTime() / 1000);
      if (expire > now) {
        this.authService.setUpAfterLogin(token);
        this.isAuthenticated = true;
        this.currentUser = { ...user };
        this.reupDectected = +localStorage.getItem('reup');
      } else {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('reup');
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  onLogout() {
    this.authService.logOut();
  }

  onUploadMusic() {
    this.router.navigate(['/upload']);
  }

  onDashBoard() {
    this.router.navigate(['/dashboard/upload-song']);
  }

  onUploadCateGory() {
    this.router.navigate(['/manage-categories/upload-category']);
  }

  onSeeNotifications() {
    this.dialog.open(PopupNotificationsComponent, { data: this.notifications ? this.notifications : [] });
  }

  getNumberOfNotificationsUnread() {
    let result = 0;
    this.notifications.forEach(item => {
      if (!item.isRead) {
        result++;
      }
    });
    return result;
  }

}
