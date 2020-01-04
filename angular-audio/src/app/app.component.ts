import { Component, OnInit } from '@angular/core';
import { AudioService } from './services/audio.service';
import { AuthService } from './services/auth.service';
import { DECODE_TOKEN } from './interfaces/decode-token';
import decode from 'jwt-decode';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UploadService } from './services/upload.service';

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
  constructor(
    private audioSerive: AudioService,
    private authService: AuthService,
    private router: Router,
    private uploadService: UploadService) {
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
}
