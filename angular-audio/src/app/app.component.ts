import { Component, OnInit } from '@angular/core';
import { AudioService } from './services/audio.service';
import { AuthService } from './services/auth.service';
import { DECODE_TOKEN } from './interfaces/decode-token';
import decode from 'jwt-decode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', '../../node_modules/bootstrap/dist/css/bootstrap.min.css']
})
export class AppComponent implements OnInit {
  playMode = false;
  isAuthenticated = false;
  currentUser: DECODE_TOKEN;
  constructor(private audioSerive: AudioService, private authService: AuthService, private router: Router) { }
  ngOnInit() {
    this.checkToken();
    this.audioSerive.getPlayModeSubject().subscribe((v: any) => this.playMode = v);
    this.authService.getIsAuthenticatedSubject().subscribe((isAuthenticated: boolean) => this.isAuthenticated = isAuthenticated);
    this.authService.getCurrentUserSubject().subscribe((currentUser: DECODE_TOKEN) => this.currentUser = currentUser);
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
      } else {
        localStorage.removeItem('jwtToken');
      }
    }
  }

  onLogout() {
    this.authService.logOut();
  }

  onUploadMusic() {
    this.router.navigate(['/upload']);
  }
}
